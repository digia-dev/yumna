import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
  ) {}

  /**
   * Get all wallets for a specific family
   */
  async getWallets(familyId: string) {
    return this.prisma.wallet.findMany({
      where: { familyId, isDeleted: false },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new wallet
   */
  async createWallet(
    userId: string,
    familyId: string,
    data: { name: string; balance: number; currency?: string; type?: string },
  ) {
    return this.prisma.wallet.create({
      data: {
        ...data,
        userId,
        familyId,
      },
    });
  }

  /**
   * Update an existing wallet
   */
  async updateWallet(
    walletId: string,
    familyId: string,
    data: Partial<{
      name: string;
      balance: number;
      currency: string;
      type: string;
    }>,
  ) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, familyId, isDeleted: false },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    return this.prisma.wallet.update({
      where: { id: walletId },
      data,
    });
  }

  /**
   * Soft delete a wallet
   */
  async deleteWallet(walletId: string, familyId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, familyId, isDeleted: false },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    // Future: Check if wallet has transactions or mark them as orphan?
    // For now just soft delete
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  /**
   * Create a new transaction and update wallet balance
   */
  async createTransaction(
    userId: string,
    familyId: string,
    data: {
      walletId: string;
      amount: number;
      type: TransactionType;
      category: string;
      description?: string;
      tags?: string[];
      savingsGoalId?: string;
      attachmentUrl?: string;
      location?: any;
      metadata?: any;
    },
  ) {
    // 0. Check for Child Allowance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, allowanceLimit: true },
    });

    if (user?.role === 'ANAK' && user.allowanceLimit) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlySpent = await this.prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: startOfMonth },
          isDeleted: false,
        },
        _sum: { amount: true },
      });

      const currentTotal = Number(monthlySpent._sum.amount || 0);
      if (currentTotal + data.amount > Number(user.allowanceLimit)) {
        throw new Error(
          `Batas uang saku terlampaui! Sisa limit: ${Number(user.allowanceLimit) - currentTotal}`,
        );
      }
    }

    // 1. Verify wallet belongs to family
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: data.walletId, familyId, isDeleted: false },
    });

    if (!wallet)
      throw new NotFoundException('Wallet not found or not in family');

    // 1.1 Check Granular Permissions
    const permissions = await this.prisma.walletPermission.findFirst({
      where: { walletId: data.walletId, userId },
    });

    if (permissions && !permissions.canEdit) {
      throw new Error(
        'Anda tidak memiliki izin untuk mencatat transaksi di dompet ini.',
      );
    }

    // 2. Perform transaction in a transaction block
    return this.prisma.$transaction(async (tx) => {
      // Create Transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          type: data.type,
          category: data.category,
          description: data.description,
          tags: data.tags || [],
          walletId: data.walletId,
          savingsGoalId: data.savingsGoalId,
          attachmentUrl: data.attachmentUrl,
          location: data.location || null,
          userId,
          familyId,
          metadata: data.metadata || null,
        },
      });

      // Update Wallet Balance
      const balanceChange =
        data.type === TransactionType.INCOME ? data.amount : -data.amount;

      await tx.wallet.update({
        where: { id: data.walletId },
        data: {
          balance: { increment: balanceChange },
        },
      });

      // Create Notification
      const family = await tx.family.findUnique({
        where: { id: familyId },
        include: { members: true },
      });

      if (family) {
        // Simple Alert: Notify the person who recorded it
        await tx.notification.create({
          data: {
            title: 'Transaksi Berhasil',
            message: `Catatan ${data.category} sebesar ${data.amount} telah disimpan.`,
            userId,
          },
        });

        // Notify Family Head if not the same person
        const head = family.members.find((m) => m.role === 'KEPALA_KELUARGA');
        if (head && head.id !== userId) {
          await tx.notification.create({
            data: {
              title: 'Laporan Keuangan Baru',
              message: `${family.members.find((m) => m.id === userId)?.name} mencatat ${data.type.toLowerCase()} ${data.category}.`,
              userId: head.id,
            },
          });
        }
      }

      if (data.savingsGoalId) {
        // Simple logic: Income increases goal, Expense decreases it
        const goalChange =
          data.type === TransactionType.INCOME ? data.amount : -data.amount;
        await tx.savingsGoal.update({
          where: { id: data.savingsGoalId },
          data: { currentAmount: { increment: goalChange } },
        });

        // Task 328: Add points for saving
        if (data.type === TransactionType.INCOME) {
          await this.gamificationService.addPoints(
            familyId,
            50,
            'Menyisihkan uang untuk tujuan masa depan.',
          );
        }
      }

      // Task 328: points for recording
      await this.gamificationService.addPoints(
        familyId,
        10,
        'Mencatat transaksi keluarga.',
      );

      return transaction;
    });
  }

  /**
   * Quick Add for Siri/Shortcuts/Auto-entry
   */
  async quickAddTransaction(userId: string, familyId: string, data: any) {
    // 1. Find a default wallet if not specified
    let walletId = data.walletId;
    if (!walletId) {
      const defaultWallet = await this.prisma.wallet.findFirst({
        where: { familyId, isDeleted: false },
        orderBy: { balance: 'desc' },
      });
      if (!defaultWallet)
        throw new NotFoundException('No wallet available for family');
      walletId = defaultWallet.id;
    }

    return this.createTransaction(userId, familyId, {
      amount: Number(data.amount),
      type: data.type || TransactionType.EXPENSE,
      category: data.category || 'Lainnya',
      description: data.description || 'Pencatatan Cepat',
      walletId,
      tags: data.tags,
      metadata: { source: 'QuickAdd', ...data.metadata },
    });
  }

  /**
   * Get recent transactions for a family with isolation
   */
  async getTransactions(familyId: string, limit = 20) {
    return this.prisma.transaction.findMany({
      where: {
        wallet: { familyId },
        isDeleted: false,
      },
      include: {
        user: { select: { name: true } },
        wallet: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  /**
   * Transfer money between wallets
   */
  async transferBetweenWallets(
    userId: string,
    familyId: string,
    data: {
      fromWalletId: string;
      toWalletId: string;
      amount: number;
      description?: string;
    },
  ) {
    if (data.fromWalletId === data.toWalletId) {
      throw new BadRequestException(
        'Source and destination wallets must be different',
      );
    }

    const { fromWalletId, toWalletId, amount, description } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Verify wallets
      const fromWallet = await tx.wallet.findFirst({
        where: { id: fromWalletId, familyId, isDeleted: false },
      });
      const toWallet = await tx.wallet.findFirst({
        where: { id: toWalletId, familyId, isDeleted: false },
      });

      if (!fromWallet || !toWallet)
        throw new NotFoundException('One or both wallets not found');
      if (Number(fromWallet.balance) < amount)
        throw new BadRequestException('Insufficient balance');

      // 2. Create Transaction record (the "Transfer")
      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: TransactionType.TRANSFER,
          category: 'Transfer',
          description:
            description ||
            `Transfer of ${amount} from ${fromWallet.name} to ${toWallet.name}`,
          userId,
          familyId,
          walletId: fromWalletId,
          targetWalletId: toWalletId,
        },
      });

      // 3. Update Balances
      await tx.wallet.update({
        where: { id: fromWalletId },
        data: { balance: { decrement: amount } },
      });

      await tx.wallet.update({
        where: { id: toWalletId },
        data: { balance: { increment: amount } },
      });

      return transaction;
    });
  }

  /**
   * Update an existing transaction and adjust wallet balance
   */
  async updateTransaction(
    transactionId: string,
    familyId: string,
    data: Partial<{
      amount: number;
      type: TransactionType;
      category: string;
      description: string;
      walletId: string;
      tags: string[];
      attachmentUrl: string;
      location: any;
      metadata: any;
    }>,
  ) {
    const oldTransaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, wallet: { familyId } },
    });

    if (!oldTransaction) throw new NotFoundException('Transaction not found');

    return this.prisma.$transaction(async (tx) => {
      // 1. Revert old balance
      const revertAmount =
        oldTransaction.type === TransactionType.INCOME
          ? -Number(oldTransaction.amount)
          : Number(oldTransaction.amount);

      await tx.wallet.update({
        where: { id: oldTransaction.walletId },
        data: { balance: { increment: revertAmount } },
      });

      // 2. Update Transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          ...data,
        },
      });

      // 3. Apply new balance
      const newAmount =
        data.amount !== undefined ? data.amount : Number(oldTransaction.amount);
      const newType = data.type || oldTransaction.type;
      const newWalletId = data.walletId || oldTransaction.walletId;

      const applyAmount =
        newType === TransactionType.INCOME ? newAmount : -newAmount;

      await tx.wallet.update({
        where: { id: newWalletId },
        data: { balance: { increment: applyAmount } },
      });

      return updatedTransaction;
    });
  }

  /**
   * Soft delete a transaction (reverts balance if needed)
   */
  async deleteTransaction(transactionId: string, familyId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, wallet: { familyId } },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    return this.prisma.$transaction(async (tx) => {
      // Mark as deleted
      await tx.transaction.update({
        where: { id: transactionId },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      // Revert balance
      const revertAmount =
        transaction.type === TransactionType.INCOME
          ? -Number(transaction.amount)
          : Number(transaction.amount);

      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: { balance: { increment: revertAmount } },
      });

      return { success: true };
    });
  }

  /**
   * Get Cash Flow data for the last 30 days
   */
  async getCashFlow(familyId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: thirtyDaysAgo },
        isDeleted: false,
      },
      orderBy: { date: 'asc' },
    });

    const dailyData: Record<string, { income: number; expense: number }> = {};

    // Initialize daily data
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = { income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      const dateStr = tx.date.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        if (tx.type === TransactionType.INCOME) {
          dailyData[dateStr].income += Number(tx.amount);
        } else if (tx.type === TransactionType.EXPENSE) {
          dailyData[dateStr].expense += Number(tx.amount);
        }
      }
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get spending breakdown by category
   */
  async getCategorySpending(familyId: string, month?: string) {
    const now = new Date();
    const startDate = month
      ? new Date(`${month}-01`)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const transactions = await this.prisma.transaction.findMany({
      where: {
        familyId,
        type: TransactionType.EXPENSE,
        date: { gte: startDate, lte: endDate },
        isDeleted: false,
      },
    });

    const totals: Record<string, number> = {};
    transactions.forEach((tx) => {
      totals[tx.category] = (totals[tx.category] || 0) + Number(tx.amount);
    });

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }

  /**
   * Bulk delete transactions
   */
  async bulkDeleteTransactions(transactionIds: string[], familyId: string) {
    return this.prisma.$transaction(async (tx) => {
      for (const id of transactionIds) {
        const transaction = await tx.transaction.findFirst({
          where: { id, wallet: { familyId } },
        });
        if (transaction) {
          // Mark as deleted
          await tx.transaction.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
          });

          // Revert balance
          const revertAmount =
            transaction.type === TransactionType.INCOME
              ? -Number(transaction.amount)
              : Number(transaction.amount);

          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: { balance: { increment: revertAmount } },
          });
        }
      }
      return { success: true, count: transactionIds.length };
    });
  }

  /**
   * Get financial summary (Income, Expense, Net)
   */
  async getFinancialSummary(familyId: string, month?: string) {
    const now = new Date();
    const startDate = month
      ? new Date(`${month}-01`)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const transactions = await this.prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: startDate, lte: endDate },
        isDeleted: false,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === TransactionType.INCOME) {
        totalIncome += Number(tx.amount);
      } else if (tx.type === TransactionType.EXPENSE) {
        totalExpense += Number(tx.amount);
      }
    });

    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      currency: 'IDR', // Default for summary
    };
  }

  /**
   * Get top spending categories
   */
  async getTopCategories(familyId: string, limit = 5) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.prisma.transaction.groupBy({
      by: ['category'],
      where: {
        familyId,
        type: TransactionType.EXPENSE,
        date: { gte: startDate },
        isDeleted: false,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    return result.map((item) => ({
      category: item.category,
      amount: Number(item._sum?.amount || 0),
    }));
  }

  /**
   * Export transactions to CSV format
   */
  async exportTransactionsToCSV(familyId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { familyId, isDeleted: false },
      include: {
        wallet: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const header = [
      'Date',
      'Type',
      'Category',
      'Description',
      'Amount',
      'Wallet',
      'User',
      'Tags',
    ].join(',');
    const rows = transactions.map((tx) => {
      return [
        tx.date.toISOString(),
        tx.type,
        tx.category,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        tx.amount,
        tx.wallet.name,
        tx.user.name,
        `"${(tx.tags || []).join(', ')}"`,
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * Get unallocated funds (Zero-waste budgeting logic)
   */
  async getUnallocatedFunds(familyId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { familyId, isDeleted: false },
    });
    const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = await this.prisma.budget.findMany({
      where: { familyId, period },
    });
    const totalBudgeted = budgets.reduce(
      (acc: number, b: any) => acc + Number(b.amount),
      0,
    );

    return {
      totalBalance,
      totalBudgeted,
      unallocated: totalBalance - totalBudgeted,
      currency: 'IDR',
    };
  }

  /**
   * Calculate Financial Health Score (0-100)
   */
  async getHealthScore(familyId: string) {
    const summary = await this.getFinancialSummary(familyId);

    if (summary.income === 0) return { score: 0, status: 'NO_DATA' };

    const savingsRatio = (summary.income - summary.expense) / summary.income;

    let score = Math.round(savingsRatio * 100);
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    let status = 'Waspada';
    if (score >= 20) status = 'Cukup';
    if (score >= 40) status = 'Baik';
    if (score >= 60) status = 'Sangat Baik';
    if (score >= 80) status = 'Luar Biasa';

    return {
      score,
      status,
      savingsRatio: Math.round(savingsRatio * 100),
      period: 'Monthly',
    };
  }

  /**
   * Custom Category Management
   */
  async createCategory(
    familyId: string,
    name: string,
    type?: TransactionType,
    icon?: string,
  ) {
    return this.prisma.customCategory.create({
      data: { familyId, name, type, icon },
    });
  }

  async getCategories(familyId: string) {
    return this.prisma.customCategory.findMany({
      where: { familyId },
      orderBy: { name: 'asc' },
    });
  }

  async deleteCategory(familyId: string, id: string) {
    return this.prisma.customCategory.delete({
      where: { id, familyId },
    });
  }

  /**
   * Get Wealth Breakdown for Zakat Hub
   */
  async getWealthBreakdown(familyId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { familyId, isDeleted: false },
      select: { type: true, balance: true },
    });

    const breakdown: Record<string, number> = {
      CASH: 0,
      BANK: 0,
      INVESTMENT: 0,
      GOLD: 0,
      OTHER: 0,
    };

    let total = 0;
    wallets.forEach((w) => {
      const type = w.type || 'OTHER';
      const balance = Number(w.balance);
      breakdown[type] = (breakdown[type] || 0) + balance;
      total += balance;
    });

    if (total === 0) return [];

    return Object.entries(breakdown)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: this.getWalletTypeName(name),
        val: Math.round((value / total) * 100),
        color: this.getWalletTypeColor(name),
        amount: value,
      }));
  }

  private getWalletTypeName(type: string) {
    const names: any = {
      CASH: 'Kas & Tabungan',
      BANK: 'Rekening Bank',
      INVESTMENT: 'Investasi/Saham',
      GOLD: 'Emas & Perhiasan',
      OTHER: 'Lainnya',
    };
    return names[type] || type;
  }

  private getWalletTypeColor(type: string) {
    const colors: any = {
      CASH: 'bg-emerald-500',
      BANK: 'bg-blue-500',
      INVESTMENT: 'bg-purple-500',
      GOLD: 'bg-amber-400',
      OTHER: 'bg-slate-400',
    };
    return colors[type] || 'bg-slate-400';
  }

  /**
   * Debt & Receivable Management
   */
  async createDebt(
    familyId: string,
    data: {
      personName: string;
      amount: number;
      type: any;
      description?: string;
      dueDate?: Date;
    },
  ) {
    return this.prisma.debt.create({
      data: {
        ...data,
        familyId,
      },
    });
  }

  async getDebts(familyId: string) {
    return this.prisma.debt.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleDebtPaid(familyId: string, id: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, familyId },
    });
    if (!debt) throw new NotFoundException('Debt not found');

    return this.prisma.debt.update({
      where: { id },
      data: { isPaid: !debt.isPaid },
    });
  }

  /**
   * Performance Test: Seed and Query
   */
  async runPerformanceTest(userId: string, familyId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { familyId, isDeleted: false },
    });
    if (!wallet) throw new NotFoundException('No wallet found');

    const amountToSeed = 1000;
    const transactions = [];
    for (let i = 0; i < amountToSeed; i++) {
      transactions.push({
        amount: Math.floor(Math.random() * 1000000),
        type: i % 2 === 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
        category: 'Performance',
        description: `Seed #${i}`,
        walletId: wallet.id,
        userId,
        familyId,
        date: new Date(),
      });
    }

    const seedStart = Date.now();
    await this.prisma.transaction.createMany({ data: transactions });
    const seedEnd = Date.now();

    const queryStart = Date.now();
    const count = await this.prisma.transaction.count({ where: { familyId } });
    const top = await this.prisma.transaction.findMany({
      where: { familyId },
      orderBy: { date: 'desc' },
      take: 50,
    });
    const queryEnd = Date.now();

    return {
      seeded: amountToSeed,
      seedTime: seedEnd - seedStart,
      queryTime: queryEnd - queryStart,
      totalCount: count,
    };
  }

  /**
   * Bulk Import with Deduplication (Auto-reconcile)
   */
  async bulkImportTransactions(
    userId: string,
    familyId: string,
    walletId: string,
    data: any[],
  ) {
    // 1. Get existing transactions for this month to check for duplicates
    const existing = await this.prisma.transaction.findMany({
      where: { walletId, isDeleted: false },
      select: { amount: true, date: true, description: true },
    });

    const duplicates = new Set();
    existing.forEach((t) => {
      duplicates.add(
        `${new Date(t.date).toISOString().split('T')[0]}_${t.amount}_${t.description}`,
      );
    });

    const toImport = data.filter((t) => {
      const key = `${new Date(t.date).toISOString().split('T')[0]}_${t.amount}_${t.description}`;
      return !duplicates.has(key);
    });

    if (toImport.length === 0) return { imported: 0, skipped: data.length };

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const created = [];

      for (const item of toImport) {
        const t = await tx.transaction.create({
          data: {
            amount: item.amount,
            type: item.type as TransactionType,
            category: item.category || 'Imported',
            description: item.description,
            date: new Date(item.date),
            walletId,
            userId,
            familyId,
            metadata: { source: 'CSV_IMPORT' },
          },
        });
        created.push(t);
        totalAmount +=
          item.type === TransactionType.INCOME
            ? Number(item.amount)
            : -Number(item.amount);
      }

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: totalAmount } },
      });

      return {
        imported: created.length,
        skipped: data.length - created.length,
      };
    });
  }

  /**
   * Task 293: Get comprehensive weekly insight for AI Advisor
   */
  async getWeeklyAdvisorData(familyId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [transactions, budgets, savings] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { familyId, date: { gte: oneWeekAgo }, isDeleted: false },
        orderBy: { date: 'desc' },
      }),
      this.prisma.budget.findMany({ where: { familyId } }),
      this.prisma.savingsGoal.findMany({ where: { familyId } }),
    ]);

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      period: 'Past 7 Days',
      income,
      expense,
      balance: income - expense,
      topExpenseCategories: this.calculateCategoryBreakdown(
        transactions.filter((t) => t.type === 'EXPENSE'),
      ),
      savingsProgress: savings.map((s) => ({
        name: s.name,
        progress: Number(s.currentAmount) / Number(s.targetAmount),
      })),
    };
  }

  private calculateCategoryBreakdown(transactions: any[]) {
    const breakdown: Record<string, number> = {};
    transactions.forEach((t) => {
      breakdown[t.category] = (breakdown[t.category] || 0) + Number(t.amount);
    });
    return breakdown;
  }

  /**
   * Savings Goals CRUD
   */
  async getSavingsGoals(familyId: string) {
    return this.prisma.savingsGoal.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSavingsGoal(
    familyId: string,
    data: { name: string; targetAmount: number; deadline?: string },
  ) {
    return this.prisma.savingsGoal.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        familyId,
      },
    });
  }

  async updateSavingsGoal(id: string, familyId: string, data: any) {
    return this.prisma.savingsGoal.update({
      where: { id, familyId },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
  }

  async deleteSavingsGoal(id: string, familyId: string) {
    return this.prisma.savingsGoal.delete({
      where: { id, familyId },
    });
  }

  /**
   * Add funds to savings goal via transaction
   */
  async addFundsToGoal(
    userId: string,
    familyId: string,
    goalId: string,
    walletId: string,
    amount: number,
  ) {
    return this.createTransaction(userId, familyId, {
      walletId,
      amount,
      type: TransactionType.EXPENSE,
      category: 'Savings',
      description: `Alokasi dana ke Saving Goal`,
      savingsGoalId: goalId,
    });
  }

  /**
   * Get comparative spending analytics (Current vs Previous Month)
   */
  async getComparativeAnalytics(familyId: string) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const currentTotal = await this.prisma.transaction.aggregate({
      where: {
        familyId,
        type: TransactionType.EXPENSE,
        date: { gte: currentMonthStart },
        isDeleted: false,
      },
      _sum: { amount: true },
    });

    const prevTotal = await this.prisma.transaction.aggregate({
      where: {
        familyId,
        type: TransactionType.EXPENSE,
        date: { gte: prevMonthStart, lte: prevMonthEnd },
        isDeleted: false,
      },
      _sum: { amount: true },
    });

    const currentVal = Number(currentTotal._sum.amount || 0);
    const prevVal = Number(prevTotal._sum.amount || 0);
    const diff = currentVal - prevVal;
    const percent = prevVal > 0 ? (diff / prevVal) * 100 : 0;

    return {
      currentMonth: currentVal,
      prevMonth: prevVal,
      diff,
      percent: Math.round(percent * 10) / 10,
    };
  }

  // ── 382 Total Asset Sum ───────────────────────────────────────────────────
  async getTotalAssets(familyId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { familyId, isDeleted: false },
      select: { id: true, name: true, type: true, balance: true },
    });
    const totalAssets = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const goals = await this.prisma.savingsGoal.findMany({ where: { familyId } });
    const totalSavings = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const debts = await this.prisma.debt.findMany({ where: { familyId, isPaid: false } });
    const totalLiabilities = debts.reduce((sum, d) => sum + Number(d.amount), 0);
    return {
      totalAssets,
      totalSavings,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      walletBreakdown: wallets.map(w => ({ name: w.name, type: w.type, balance: Number(w.balance) })),
    };
  }

  // ── 393 Savings Rate Tracker ──────────────────────────────────────────────
  async getSavingsRate(familyId: string, months = 6) {
    const results = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const [inc, exp] = await Promise.all([
        this.prisma.transaction.aggregate({ where: { familyId, type: 'INCOME', date: { gte: start, lte: end }, isDeleted: false }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { familyId, type: 'EXPENSE', date: { gte: start, lte: end }, isDeleted: false }, _sum: { amount: true } }),
      ]);
      const income  = Number(inc._sum.amount || 0);
      const expense = Number(exp._sum.amount || 0);
      const saved   = income - expense;
      results.push({
        month: start.toISOString().slice(0, 7),
        income,
        expense,
        saved,
        savingsRate: income > 0 ? Math.round((saved / income) * 100) : 0,
      });
    }
    return results;
  }

  // ── 399 Debt-to-Income Ratio ──────────────────────────────────────────────
  async getDebtToIncome(familyId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const [incomeAgg, debts] = await Promise.all([
      this.prisma.transaction.aggregate({ where: { familyId, type: 'INCOME', date: { gte: start }, isDeleted: false }, _sum: { amount: true } }),
      this.prisma.debt.findMany({ where: { familyId, isPaid: false } }),
    ]);
    const monthlyIncome = Number(incomeAgg._sum.amount || 0);
    const totalDebt = debts.reduce((s, d) => s + Number(d.amount), 0);
    const dti = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;
    return {
      monthlyIncome,
      totalDebt,
      debtToIncomeRatio: Math.round(dti * 10) / 10,
      status: dti < 20 ? 'Aman' : dti < 40 ? 'Perlu Perhatian' : 'Berbahaya',
      debts: debts.map(d => ({ name: d.personName, amount: Number(d.amount), type: d.type })),
    };
  }

  // ── 400 Net Worth Tracker Over Time ──────────────────────────────────────
  async getNetWorthTimeline(familyId: string, months = 6) {
    const snapshots = await this.prisma.balanceSnapshot.findMany({
      where: { familyId },
      orderBy: { date: 'asc' },
      take: months * 30,
    });
    const byMonth: Record<string, number> = {};
    snapshots.forEach(s => {
      const key = s.date.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + Number(s.amount);
    });
    // If no snapshots, use current wallet balances as one data point
    if (Object.keys(byMonth).length === 0) {
      const wallets = await this.prisma.wallet.findMany({ where: { familyId, isDeleted: false } });
      const total = wallets.reduce((s, w) => s + Number(w.balance), 0);
      byMonth[new Date().toISOString().slice(0, 7)] = total;
    }
    return Object.entries(byMonth).map(([month, netWorth]) => ({ month, netWorth }));
  }

  // ── 392 Year-over-Year Analysis ──────────────────────────────────────────
  async getYearOverYear(familyId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
    const result = [];
    for (let m = 0; m < 12; m++) {
      const currStart = new Date(currentYear, m, 1);
      const currEnd   = new Date(currentYear, m + 1, 0, 23, 59, 59);
      const prevStart = new Date(currentYear - 1, m, 1);
      const prevEnd   = new Date(currentYear - 1, m + 1, 0, 23, 59, 59);
      const [curr, prev] = await Promise.all([
        this.prisma.transaction.aggregate({ where: { familyId, type: 'EXPENSE', date: { gte: currStart, lte: currEnd }, isDeleted: false }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { familyId, type: 'EXPENSE', date: { gte: prevStart, lte: prevEnd }, isDeleted: false }, _sum: { amount: true } }),
      ]);
      result.push({
        month: months[m],
        thisYear: Number(curr._sum.amount || 0),
        lastYear: Number(prev._sum.amount || 0),
      });
    }
    return result;
  }

  // ── 397 Anomaly Detection ─────────────────────────────────────────────────
  async detectAnomalies(familyId: string) {
    const thirtyDays = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const txs = await this.prisma.transaction.findMany({
      where: { familyId, type: 'EXPENSE', date: { gte: thirtyDays }, isDeleted: false },
      include: { user: { select: { name: true } } },
      orderBy: { amount: 'desc' },
    });
    if (txs.length < 3) return { anomalies: [], threshold: 0 };

    const amounts = txs.map(t => Number(t.amount));
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const std = Math.sqrt(amounts.reduce((s, a) => s + (a - avg) ** 2, 0) / amounts.length);
    const threshold = avg + 2 * std; // 2-sigma rule

    const anomalies = txs
      .filter(t => Number(t.amount) > threshold)
      .map(t => ({
        id: t.id,
        title: t.description || t.category,
        amount: Number(t.amount),
        category: t.category,
        date: t.date,
        user: t.user.name,
        deviation: Math.round(((Number(t.amount) - avg) / std) * 10) / 10,
      }));

    return { anomalies, threshold: Math.round(threshold), avg: Math.round(avg) };
  }

  // ── 398 Financial Forecast ────────────────────────────────────────────────
  async getForecast(familyId: string) {
    // Simple linear regression on last 3 months
    const months = await this.getSavingsRate(familyId, 3);
    if (months.length < 2) return { next: null, trend: 'INSUFFICIENT_DATA' };

    const avgExpense = months.reduce((s, m) => s + m.expense, 0) / months.length;
    const avgIncome  = months.reduce((s, m) => s + m.income, 0) / months.length;

    // Month-over-month slope for expenses
    const slope = months.length > 1
      ? (months[months.length - 1].expense - months[0].expense) / (months.length - 1)
      : 0;

    const nextExpense  = Math.max(0, avgExpense + slope);
    const nextIncome   = avgIncome; // Assume stable income
    const nextSavings  = nextIncome - nextExpense;
    const savingsRate  = nextIncome > 0 ? (nextSavings / nextIncome) * 100 : 0;

    return {
      next: {
        income:   Math.round(nextIncome),
        expense:  Math.round(nextExpense),
        savings:  Math.round(nextSavings),
        savingsRate: Math.round(savingsRate * 10) / 10,
      },
      trend: slope > 5000 ? 'INCREASING' : slope < -5000 ? 'DECREASING' : 'STABLE',
      advice: savingsRate < 10
        ? 'Pengeluaran sangat tinggi. Pertimbangkan memangkas kategori tidak esensial.'
        : savingsRate < 20
        ? 'Tingkat tabungan rendah. Cobalah menabung minimal 20% dari pemasukan.'
        : 'Alhamdulillah, keuangan keluarga dalam kondisi sehat!',
    };
  }

  // ── 396 Spending Heatmap (day-of-week x hour) ────────────────────────────
  async getSpendingHeatmap(familyId: string) {
    const thirtyDays = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const txs = await this.prisma.transaction.findMany({
      where: { familyId, type: 'EXPENSE', date: { gte: thirtyDays }, isDeleted: false },
      select: { amount: true, date: true },
    });

    // Build [day][week] matrix
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(4).fill(0));
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    txs.forEach(t => {
      const day = t.date.getDay();
      const week = Math.floor(t.date.getDate() / 7);
      matrix[day][Math.min(week, 3)] += Number(t.amount);
    });

    return {
      days,
      matrix,
      maxValue: Math.max(...matrix.flat()),
    };
  }

  // ── 391 Drill-down Analytics ─────────────────────────────────────────────
  async getCategoryDrilldown(familyId: string, category: string, months = 3) {
    const start = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
    const txs = await this.prisma.transaction.findMany({
      where: { familyId, category, type: 'EXPENSE', date: { gte: start }, isDeleted: false },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

    const byUser: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    txs.forEach(t => {
      byUser[t.user.name] = (byUser[t.user.name] || 0) + Number(t.amount);
      const m = t.date.toISOString().slice(0, 7);
      byMonth[m] = (byMonth[m] || 0) + Number(t.amount);
    });

    return {
      category,
      total: txs.reduce((s, t) => s + Number(t.amount), 0),
      count: txs.length,
      byUser: Object.entries(byUser).map(([name, amount]) => ({ name, amount })),
      byMonth: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })),
      transactions: txs.slice(0, 10).map(t => ({
        date: t.date,
        amount: Number(t.amount),
        description: t.description,
        user: t.user.name,
      })),
    };
  }
}
