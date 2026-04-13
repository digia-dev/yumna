import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

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
  async createWallet(userId: string, familyId: string, data: { name: string; balance: number; currency?: string; type?: string }) {
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
  async updateWallet(walletId: string, familyId: string, data: Partial<{ name: string; balance: number; currency: string; type: string }>) {
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
  async createTransaction(userId: string, familyId: string, data: {
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
  }) {
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
        throw new Error(`Batas uang saku terlampaui! Sisa limit: ${Number(user.allowanceLimit) - currentTotal}`);
      }
    }

    // 1. Verify wallet belongs to family
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: data.walletId, familyId, isDeleted: false },
    });

    if (!wallet) throw new NotFoundException('Wallet not found or not in family');

    // 1.1 Check Granular Permissions
    const permissions = await this.prisma.walletPermission.findFirst({
      where: { walletId: data.walletId, userId },
    });

    if (permissions && !permissions.canEdit) {
      throw new Error('Anda tidak memiliki izin untuk mencatat transaksi di dompet ini.');
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
      const balanceChange = data.type === TransactionType.INCOME ? data.amount : -data.amount;
      
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
        const head = family.members.find(m => m.role === 'KEPALA_KELUARGA');
        if (head && head.id !== userId) {
          await tx.notification.create({
            data: {
              title: 'Laporan Keuangan Baru',
              message: `${family.members.find(m => m.id === userId)?.name} mencatat ${data.type.toLowerCase()} ${data.category}.`,
              userId: head.id,
            },
          });
        }
      }

      // Update Savings Goal if linked
      if (data.savingsGoalId) {
        // Simple logic: Income increases goal, Expense decreases it
        const goalChange = data.type === TransactionType.INCOME ? data.amount : -data.amount;
        await tx.savingsGoal.update({
          where: { id: data.savingsGoalId },
          data: { currentAmount: { increment: goalChange } },
        });
      }

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
      if (!defaultWallet) throw new NotFoundException('No wallet available for family');
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
  async transferBetweenWallets(userId: string, familyId: string, data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    description?: string;
  }) {
    if (data.fromWalletId === data.toWalletId) {
      throw new BadRequestException('Source and destination wallets must be different');
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

      if (!fromWallet || !toWallet) throw new NotFoundException('One or both wallets not found');
      if (Number(fromWallet.balance) < amount) throw new BadRequestException('Insufficient balance');

      // 2. Create Transaction record (the "Transfer")
      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: TransactionType.TRANSFER,
          category: 'Transfer',
          description: description || `Transfer of ${amount} from ${fromWallet.name} to ${toWallet.name}`,
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
  async updateTransaction(transactionId: string, familyId: string, data: Partial<{
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    walletId: string;
    tags: string[];
    attachmentUrl: string;
    location: any;
    metadata: any;
  }>) {
    const oldTransaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, wallet: { familyId } },
    });

    if (!oldTransaction) throw new NotFoundException('Transaction not found');

    return this.prisma.$transaction(async (tx) => {
      // 1. Revert old balance
      const revertAmount = oldTransaction.type === TransactionType.INCOME 
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
      const newAmount = data.amount !== undefined ? data.amount : Number(oldTransaction.amount);
      const newType = data.type || oldTransaction.type;
      const newWalletId = data.walletId || oldTransaction.walletId;

      const applyAmount = newType === TransactionType.INCOME ? newAmount : -newAmount;

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
      const revertAmount = transaction.type === TransactionType.INCOME 
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

    transactions.forEach(tx => {
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
    const startDate = month ? new Date(`${month}-01`) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        familyId,
        type: TransactionType.EXPENSE,
        date: { gte: startDate, lte: endDate },
        isDeleted: false,
      },
    });

    const totals: Record<string, number> = {};
    transactions.forEach(tx => {
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
          const revertAmount = transaction.type === TransactionType.INCOME 
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
    const startDate = month ? new Date(`${month}-01`) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: startDate, lte: endDate },
        isDeleted: false,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
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

    return result.map(item => ({
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
      include: { wallet: { select: { name: true } }, user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

    const header = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Wallet', 'User', 'Tags'].join(',');
    const rows = transactions.map(tx => {
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
    const totalBudgeted = budgets.reduce((acc: number, b: any) => acc + Number(b.amount), 0);

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
  async createCategory(familyId: string, name: string, type?: TransactionType, icon?: string) {
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
   * Debt & Receivable Management
   */
  async createDebt(familyId: string, data: { personName: string; amount: number; type: any; description?: string; dueDate?: Date }) {
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
    const wallet = await this.prisma.wallet.findFirst({ where: { familyId, isDeleted: false } });
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
  async bulkImportTransactions(userId: string, familyId: string, walletId: string, data: any[]) {
    // 1. Get existing transactions for this month to check for duplicates
    const existing = await this.prisma.transaction.findMany({
      where: { walletId, isDeleted: false },
      select: { amount: true, date: true, description: true },
    });

    const duplicates = new Set();
    existing.forEach(t => {
      duplicates.add(`${new Date(t.date).toISOString().split('T')[0]}_${t.amount}_${t.description}`);
    });

    const toImport = data.filter(t => {
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
        totalAmount += item.type === TransactionType.INCOME ? Number(item.amount) : -Number(item.amount);
      }

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: totalAmount } },
      });

      return { imported: created.length, skipped: data.length - created.length };
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
        orderBy: { date: 'desc' }
      }),
      this.prisma.budget.findMany({ where: { familyId } }),
      this.prisma.savingsGoal.findMany({ where: { familyId } })
    ]);

    const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      period: 'Past 7 Days',
      income,
      expense,
      balance: income - expense,
      topCategories: this.calculateTopCategories(transactions),
      budgetUsage: budgets.map(b => ({
        category: b.category,
        limit: Number(b.amount),
        spent: transactions.filter(t => t.category === b.category && t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0)
      })),
      savingsProgress: savings.map(s => ({
        name: s.name,
        progress: (Number(s.currentAmount) / Number(s.targetAmount)) * 100
      }))
    };
  }

  private calculateTopCategories(transactions: any[]) {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }
}
