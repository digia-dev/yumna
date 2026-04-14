import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { GamificationService } from '../gamification/gamification.service';
export declare class FinanceService {
    private prisma;
    private gamificationService;
    constructor(prisma: PrismaService, gamificationService: GamificationService);
    getWallets(familyId: string): Promise<({
        user: {
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        name: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
    })[]>;
    createWallet(userId: string, familyId: string, data: {
        name: string;
        balance: number;
        currency?: string;
        type?: string;
    }): Promise<{
        id: string;
        name: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
    }>;
    updateWallet(walletId: string, familyId: string, data: Partial<{
        name: string;
        balance: number;
        currency: string;
        type: string;
    }>): Promise<{
        id: string;
        name: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
    }>;
    deleteWallet(walletId: string, familyId: string): Promise<{
        id: string;
        name: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
    }>;
    createTransaction(userId: string, familyId: string, data: {
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
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        category: string;
        description: string | null;
        tags: string[];
        attachmentUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
        targetWalletId: string | null;
        savingsGoalId: string | null;
    }>;
    quickAddTransaction(userId: string, familyId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        category: string;
        description: string | null;
        tags: string[];
        attachmentUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
        targetWalletId: string | null;
        savingsGoalId: string | null;
    }>;
    getTransactions(familyId: string, limit?: number): Promise<({
        user: {
            name: string;
        };
        wallet: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        category: string;
        description: string | null;
        tags: string[];
        attachmentUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
        targetWalletId: string | null;
        savingsGoalId: string | null;
    })[]>;
    transferBetweenWallets(userId: string, familyId: string, data: {
        fromWalletId: string;
        toWalletId: string;
        amount: number;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        category: string;
        description: string | null;
        tags: string[];
        attachmentUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
        targetWalletId: string | null;
        savingsGoalId: string | null;
    }>;
    updateTransaction(transactionId: string, familyId: string, data: Partial<{
        amount: number;
        type: TransactionType;
        category: string;
        description: string;
        walletId: string;
        tags: string[];
        attachmentUrl: string;
        location: any;
        metadata: any;
    }>): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        category: string;
        description: string | null;
        tags: string[];
        attachmentUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
        targetWalletId: string | null;
        savingsGoalId: string | null;
    }>;
    deleteTransaction(transactionId: string, familyId: string): Promise<{
        success: boolean;
    }>;
    getCashFlow(familyId: string): Promise<{
        income: number;
        expense: number;
        date: string;
    }[]>;
    getCategorySpending(familyId: string, month?: string): Promise<{
        name: string;
        value: number;
    }[]>;
    bulkDeleteTransactions(transactionIds: string[], familyId: string): Promise<{
        success: boolean;
        count: number;
    }>;
    getFinancialSummary(familyId: string, month?: string): Promise<{
        income: number;
        expense: number;
        net: number;
        currency: string;
    }>;
    getTopCategories(familyId: string, limit?: number): Promise<{
        category: string;
        amount: number;
    }[]>;
    exportTransactionsToCSV(familyId: string): Promise<string>;
    getUnallocatedFunds(familyId: string): Promise<{
        totalBalance: number;
        totalBudgeted: number;
        unallocated: number;
        currency: string;
    }>;
    getHealthScore(familyId: string): Promise<{
        score: number;
        status: string;
        savingsRatio?: undefined;
        period?: undefined;
    } | {
        score: number;
        status: string;
        savingsRatio: number;
        period: string;
    }>;
    createCategory(familyId: string, name: string, type?: TransactionType, icon?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType | null;
        icon: string | null;
    }>;
    getCategories(familyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType | null;
        icon: string | null;
    }[]>;
    deleteCategory(familyId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType | null;
        icon: string | null;
    }>;
    getWealthBreakdown(familyId: string): Promise<{
        name: any;
        val: number;
        color: any;
        amount: number;
    }[]>;
    private getWalletTypeName;
    private getWalletTypeColor;
    createDebt(familyId: string, data: {
        personName: string;
        amount: number;
        type: any;
        description?: string;
        dueDate?: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.DebtType;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
        personName: string;
        dueDate: Date | null;
        isPaid: boolean;
    }>;
    getDebts(familyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.DebtType;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
        personName: string;
        dueDate: Date | null;
        isPaid: boolean;
    }[]>;
    toggleDebtPaid(familyId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.DebtType;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
        personName: string;
        dueDate: Date | null;
        isPaid: boolean;
    }>;
    runPerformanceTest(userId: string, familyId: string): Promise<{
        seeded: number;
        seedTime: number;
        queryTime: number;
        totalCount: number;
    }>;
    bulkImportTransactions(userId: string, familyId: string, walletId: string, data: any[]): Promise<{
        imported: number;
        skipped: number;
    }>;
    getWeeklyAdvisorData(familyId: string): Promise<{
        period: string;
        income: number;
        expense: number;
        balance: number;
        topExpenseCategories: Record<string, number>;
        savingsProgress: {
            name: string;
            progress: number;
        }[];
    }>;
    private calculateCategoryBreakdown;
    getSavingsGoals(familyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        targetAmount: import("@prisma/client-runtime-utils").Decimal;
        currentAmount: import("@prisma/client-runtime-utils").Decimal;
        deadline: Date | null;
    }[]>;
    createSavingsGoal(familyId: string, data: {
        name: string;
        targetAmount: number;
        deadline?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        targetAmount: import("@prisma/client-runtime-utils").Decimal;
        currentAmount: import("@prisma/client-runtime-utils").Decimal;
        deadline: Date | null;
    }>;
    updateSavingsGoal(id: string, familyId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        targetAmount: import("@prisma/client-runtime-utils").Decimal;
        currentAmount: import("@prisma/client-runtime-utils").Decimal;
        deadline: Date | null;
    }>;
    deleteSavingsGoal(id: string, familyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        targetAmount: import("@prisma/client-runtime-utils").Decimal;
        currentAmount: import("@prisma/client-runtime-utils").Decimal;
        deadline: Date | null;
    }>;
    addFundsToGoal(userId: string, familyId: string, goalId: string, walletId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        category: string;
        description: string | null;
        tags: string[];
        attachmentUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
        targetWalletId: string | null;
        savingsGoalId: string | null;
    }>;
}
