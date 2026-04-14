"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const gamification_service_1 = require("../gamification/gamification.service");
let FinanceService = class FinanceService {
    prisma;
    gamificationService;
    constructor(prisma, gamificationService) {
        this.prisma = prisma;
        this.gamificationService = gamificationService;
    }
    async getWallets(familyId) {
        return this.prisma.wallet.findMany({
            where: { familyId, isDeleted: false },
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createWallet(userId, familyId, data) {
        return this.prisma.wallet.create({
            data: {
                ...data,
                userId,
                familyId,
            },
        });
    }
    async updateWallet(walletId, familyId, data) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, familyId, isDeleted: false },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        return this.prisma.wallet.update({
            where: { id: walletId },
            data,
        });
    }
    async deleteWallet(walletId, familyId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, familyId, isDeleted: false },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        return this.prisma.wallet.update({
            where: { id: walletId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
    async createTransaction(userId, familyId, data) {
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
                    type: client_1.TransactionType.EXPENSE,
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
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: data.walletId, familyId, isDeleted: false },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found or not in family');
        const permissions = await this.prisma.walletPermission.findFirst({
            where: { walletId: data.walletId, userId },
        });
        if (permissions && !permissions.canEdit) {
            throw new Error('Anda tidak memiliki izin untuk mencatat transaksi di dompet ini.');
        }
        return this.prisma.$transaction(async (tx) => {
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
            const balanceChange = data.type === client_1.TransactionType.INCOME ? data.amount : -data.amount;
            await tx.wallet.update({
                where: { id: data.walletId },
                data: {
                    balance: { increment: balanceChange },
                },
            });
            const family = await tx.family.findUnique({
                where: { id: familyId },
                include: { members: true },
            });
            if (family) {
                await tx.notification.create({
                    data: {
                        title: 'Transaksi Berhasil',
                        message: `Catatan ${data.category} sebesar ${data.amount} telah disimpan.`,
                        userId,
                    },
                });
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
            if (data.savingsGoalId) {
                const goalChange = data.type === client_1.TransactionType.INCOME ? data.amount : -data.amount;
                await tx.savingsGoal.update({
                    where: { id: data.savingsGoalId },
                    data: { currentAmount: { increment: goalChange } },
                });
                if (data.type === client_1.TransactionType.INCOME) {
                    await this.gamificationService.addPoints(familyId, 50, 'Menyisihkan uang untuk tujuan masa depan.');
                }
            }
            await this.gamificationService.addPoints(familyId, 10, 'Mencatat transaksi keluarga.');
            return transaction;
        });
    }
    async quickAddTransaction(userId, familyId, data) {
        let walletId = data.walletId;
        if (!walletId) {
            const defaultWallet = await this.prisma.wallet.findFirst({
                where: { familyId, isDeleted: false },
                orderBy: { balance: 'desc' },
            });
            if (!defaultWallet)
                throw new common_1.NotFoundException('No wallet available for family');
            walletId = defaultWallet.id;
        }
        return this.createTransaction(userId, familyId, {
            amount: Number(data.amount),
            type: data.type || client_1.TransactionType.EXPENSE,
            category: data.category || 'Lainnya',
            description: data.description || 'Pencatatan Cepat',
            walletId,
            tags: data.tags,
            metadata: { source: 'QuickAdd', ...data.metadata },
        });
    }
    async getTransactions(familyId, limit = 20) {
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
    async transferBetweenWallets(userId, familyId, data) {
        if (data.fromWalletId === data.toWalletId) {
            throw new common_1.BadRequestException('Source and destination wallets must be different');
        }
        const { fromWalletId, toWalletId, amount, description } = data;
        return this.prisma.$transaction(async (tx) => {
            const fromWallet = await tx.wallet.findFirst({
                where: { id: fromWalletId, familyId, isDeleted: false },
            });
            const toWallet = await tx.wallet.findFirst({
                where: { id: toWalletId, familyId, isDeleted: false },
            });
            if (!fromWallet || !toWallet)
                throw new common_1.NotFoundException('One or both wallets not found');
            if (Number(fromWallet.balance) < amount)
                throw new common_1.BadRequestException('Insufficient balance');
            const transaction = await tx.transaction.create({
                data: {
                    amount,
                    type: client_1.TransactionType.TRANSFER,
                    category: 'Transfer',
                    description: description || `Transfer of ${amount} from ${fromWallet.name} to ${toWallet.name}`,
                    userId,
                    familyId,
                    walletId: fromWalletId,
                    targetWalletId: toWalletId,
                },
            });
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
    async updateTransaction(transactionId, familyId, data) {
        const oldTransaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId, wallet: { familyId } },
        });
        if (!oldTransaction)
            throw new common_1.NotFoundException('Transaction not found');
        return this.prisma.$transaction(async (tx) => {
            const revertAmount = oldTransaction.type === client_1.TransactionType.INCOME
                ? -Number(oldTransaction.amount)
                : Number(oldTransaction.amount);
            await tx.wallet.update({
                where: { id: oldTransaction.walletId },
                data: { balance: { increment: revertAmount } },
            });
            const updatedTransaction = await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    ...data,
                },
            });
            const newAmount = data.amount !== undefined ? data.amount : Number(oldTransaction.amount);
            const newType = data.type || oldTransaction.type;
            const newWalletId = data.walletId || oldTransaction.walletId;
            const applyAmount = newType === client_1.TransactionType.INCOME ? newAmount : -newAmount;
            await tx.wallet.update({
                where: { id: newWalletId },
                data: { balance: { increment: applyAmount } },
            });
            return updatedTransaction;
        });
    }
    async deleteTransaction(transactionId, familyId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId, wallet: { familyId } },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.transaction.update({
                where: { id: transactionId },
                data: { isDeleted: true, deletedAt: new Date() },
            });
            const revertAmount = transaction.type === client_1.TransactionType.INCOME
                ? -Number(transaction.amount)
                : Number(transaction.amount);
            await tx.wallet.update({
                where: { id: transaction.walletId },
                data: { balance: { increment: revertAmount } },
            });
            return { success: true };
        });
    }
    async getCashFlow(familyId) {
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
        const dailyData = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyData[dateStr] = { income: 0, expense: 0 };
        }
        transactions.forEach(tx => {
            const dateStr = tx.date.toISOString().split('T')[0];
            if (dailyData[dateStr]) {
                if (tx.type === client_1.TransactionType.INCOME) {
                    dailyData[dateStr].income += Number(tx.amount);
                }
                else if (tx.type === client_1.TransactionType.EXPENSE) {
                    dailyData[dateStr].expense += Number(tx.amount);
                }
            }
        });
        return Object.entries(dailyData)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    async getCategorySpending(familyId, month) {
        const now = new Date();
        const startDate = month ? new Date(`${month}-01`) : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                familyId,
                type: client_1.TransactionType.EXPENSE,
                date: { gte: startDate, lte: endDate },
                isDeleted: false,
            },
        });
        const totals = {};
        transactions.forEach(tx => {
            totals[tx.category] = (totals[tx.category] || 0) + Number(tx.amount);
        });
        return Object.entries(totals).map(([name, value]) => ({ name, value }));
    }
    async bulkDeleteTransactions(transactionIds, familyId) {
        return this.prisma.$transaction(async (tx) => {
            for (const id of transactionIds) {
                const transaction = await tx.transaction.findFirst({
                    where: { id, wallet: { familyId } },
                });
                if (transaction) {
                    await tx.transaction.update({
                        where: { id },
                        data: { isDeleted: true, deletedAt: new Date() },
                    });
                    const revertAmount = transaction.type === client_1.TransactionType.INCOME
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
    async getFinancialSummary(familyId, month) {
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
            if (tx.type === client_1.TransactionType.INCOME) {
                totalIncome += Number(tx.amount);
            }
            else if (tx.type === client_1.TransactionType.EXPENSE) {
                totalExpense += Number(tx.amount);
            }
        });
        return {
            income: totalIncome,
            expense: totalExpense,
            net: totalIncome - totalExpense,
            currency: 'IDR',
        };
    }
    async getTopCategories(familyId, limit = 5) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const result = await this.prisma.transaction.groupBy({
            by: ['category'],
            where: {
                familyId,
                type: client_1.TransactionType.EXPENSE,
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
    async exportTransactionsToCSV(familyId) {
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
    async getUnallocatedFunds(familyId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { familyId, isDeleted: false },
        });
        const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const budgets = await this.prisma.budget.findMany({
            where: { familyId, period },
        });
        const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
        return {
            totalBalance,
            totalBudgeted,
            unallocated: totalBalance - totalBudgeted,
            currency: 'IDR',
        };
    }
    async getHealthScore(familyId) {
        const summary = await this.getFinancialSummary(familyId);
        if (summary.income === 0)
            return { score: 0, status: 'NO_DATA' };
        const savingsRatio = (summary.income - summary.expense) / summary.income;
        let score = Math.round(savingsRatio * 100);
        if (score < 0)
            score = 0;
        if (score > 100)
            score = 100;
        let status = 'Waspada';
        if (score >= 20)
            status = 'Cukup';
        if (score >= 40)
            status = 'Baik';
        if (score >= 60)
            status = 'Sangat Baik';
        if (score >= 80)
            status = 'Luar Biasa';
        return {
            score,
            status,
            savingsRatio: Math.round(savingsRatio * 100),
            period: 'Monthly',
        };
    }
    async createCategory(familyId, name, type, icon) {
        return this.prisma.customCategory.create({
            data: { familyId, name, type, icon },
        });
    }
    async getCategories(familyId) {
        return this.prisma.customCategory.findMany({
            where: { familyId },
            orderBy: { name: 'asc' },
        });
    }
    async deleteCategory(familyId, id) {
        return this.prisma.customCategory.delete({
            where: { id, familyId },
        });
    }
    async getWealthBreakdown(familyId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { familyId, isDeleted: false },
            select: { type: true, balance: true }
        });
        const breakdown = {
            'CASH': 0,
            'BANK': 0,
            'INVESTMENT': 0,
            'GOLD': 0,
            'OTHER': 0
        };
        let total = 0;
        wallets.forEach(w => {
            const type = w.type || 'OTHER';
            const balance = Number(w.balance);
            breakdown[type] = (breakdown[type] || 0) + balance;
            total += balance;
        });
        if (total === 0)
            return [];
        return Object.entries(breakdown)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({
            name: this.getWalletTypeName(name),
            val: Math.round((value / total) * 100),
            color: this.getWalletTypeColor(name),
            amount: value
        }));
    }
    getWalletTypeName(type) {
        const names = {
            'CASH': 'Kas & Tabungan',
            'BANK': 'Rekening Bank',
            'INVESTMENT': 'Investasi/Saham',
            'GOLD': 'Emas & Perhiasan',
            'OTHER': 'Lainnya'
        };
        return names[type] || type;
    }
    getWalletTypeColor(type) {
        const colors = {
            'CASH': 'bg-emerald-500',
            'BANK': 'bg-blue-500',
            'INVESTMENT': 'bg-purple-500',
            'GOLD': 'bg-amber-400',
            'OTHER': 'bg-slate-400'
        };
        return colors[type] || 'bg-slate-400';
    }
    async createDebt(familyId, data) {
        return this.prisma.debt.create({
            data: {
                ...data,
                familyId,
            },
        });
    }
    async getDebts(familyId) {
        return this.prisma.debt.findMany({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async toggleDebtPaid(familyId, id) {
        const debt = await this.prisma.debt.findFirst({
            where: { id, familyId },
        });
        if (!debt)
            throw new common_1.NotFoundException('Debt not found');
        return this.prisma.debt.update({
            where: { id },
            data: { isPaid: !debt.isPaid },
        });
    }
    async runPerformanceTest(userId, familyId) {
        const wallet = await this.prisma.wallet.findFirst({ where: { familyId, isDeleted: false } });
        if (!wallet)
            throw new common_1.NotFoundException('No wallet found');
        const amountToSeed = 1000;
        const transactions = [];
        for (let i = 0; i < amountToSeed; i++) {
            transactions.push({
                amount: Math.floor(Math.random() * 1000000),
                type: i % 2 === 0 ? client_1.TransactionType.INCOME : client_1.TransactionType.EXPENSE,
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
    async bulkImportTransactions(userId, familyId, walletId, data) {
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
        if (toImport.length === 0)
            return { imported: 0, skipped: data.length };
        return this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const created = [];
            for (const item of toImport) {
                const t = await tx.transaction.create({
                    data: {
                        amount: item.amount,
                        type: item.type,
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
                totalAmount += item.type === client_1.TransactionType.INCOME ? Number(item.amount) : -Number(item.amount);
            }
            await tx.wallet.update({
                where: { id: walletId },
                data: { balance: { increment: totalAmount } },
            });
            return { imported: created.length, skipped: data.length - created.length };
        });
    }
    async getWeeklyAdvisorData(familyId) {
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
            topExpenseCategories: this.calculateCategoryBreakdown(transactions.filter(t => t.type === 'EXPENSE')),
            savingsProgress: savings.map(s => ({ name: s.name, progress: Number(s.currentAmount) / Number(s.targetAmount) }))
        };
    }
    calculateCategoryBreakdown(transactions) {
        const breakdown = {};
        transactions.forEach(t => {
            breakdown[t.category] = (breakdown[t.category] || 0) + Number(t.amount);
        });
        return breakdown;
    }
    async getSavingsGoals(familyId) {
        return this.prisma.savingsGoal.findMany({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createSavingsGoal(familyId, data) {
        return this.prisma.savingsGoal.create({
            data: {
                ...data,
                deadline: data.deadline ? new Date(data.deadline) : null,
                familyId,
            },
        });
    }
    async updateSavingsGoal(id, familyId, data) {
        return this.prisma.savingsGoal.update({
            where: { id, familyId },
            data: {
                ...data,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
            },
        });
    }
    async deleteSavingsGoal(id, familyId) {
        return this.prisma.savingsGoal.delete({
            where: { id, familyId },
        });
    }
    async addFundsToGoal(userId, familyId, goalId, walletId, amount) {
        return this.createTransaction(userId, familyId, {
            walletId,
            amount,
            type: client_1.TransactionType.EXPENSE,
            category: 'Savings',
            description: `Alokasi dana ke Saving Goal`,
            savingsGoalId: goalId,
        });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => gamification_service_1.GamificationService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gamification_service_1.GamificationService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map