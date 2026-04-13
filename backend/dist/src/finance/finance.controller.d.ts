import type { Response } from 'express';
import { FinanceService } from './finance.service';
import { CreateTransactionDto, CreateWalletDto } from './dto/finance.dto';
import { TransactionType } from '@prisma/client';
export declare class FinanceController {
    private financeService;
    constructor(financeService: FinanceService);
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
    createWallet(userId: string, familyId: string, dto: CreateWalletDto): Promise<{
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
    updateWallet(id: string, familyId: string, dto: Partial<CreateWalletDto>): Promise<{
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
    deleteWallet(id: string, familyId: string): Promise<{
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
    createTransaction(userId: string, familyId: string, dto: CreateTransactionDto): Promise<{
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
    createDebt(familyId: string, body: any): Promise<{
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
    toggleDebt(familyId: string, id: string): Promise<{
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
    getCategories(familyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType | null;
        icon: string | null;
    }[]>;
    createCategory(familyId: string, body: {
        name: string;
        type?: TransactionType;
        icon?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType | null;
        icon: string | null;
    }>;
    deleteCategory(familyId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: import("@prisma/client").$Enums.TransactionType | null;
        icon: string | null;
    }>;
    quickAdd(userId: string, familyId: string, data: any): Promise<{
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
    getTransactions(familyId: string): Promise<({
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
    getSummary(familyId: string, month?: string): Promise<{
        income: number;
        expense: number;
        net: number;
        currency: string;
    }>;
    getTopCategories(familyId: string, limit?: number): Promise<{
        category: string;
        amount: number;
    }[]>;
    getHealth(familyId: string): Promise<{
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
    getUnallocated(familyId: string): Promise<{
        totalBalance: number;
        totalBudgeted: number;
        unallocated: number;
        currency: string;
    }>;
    runPerfTest(userId: string, familyId: string): Promise<{
        totalExecutionTime: number;
        seeded: number;
        seedTime: number;
        queryTime: number;
        totalCount: number;
    }>;
    importTransactions(walletId: string, userId: string, familyId: string, body: {
        transactions: any[];
    }): Promise<{
        imported: number;
        skipped: number;
    }>;
    exportTransactions(familyId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getCashFlow(familyId: string): Promise<{
        income: number;
        expense: number;
        date: string;
    }[]>;
    getCategorySpending(familyId: string, month?: string): Promise<{
        name: string;
        value: number;
    }[]>;
    transfer(userId: string, familyId: string, body: {
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
    updateTransaction(id: string, familyId: string, body: any): Promise<{
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
    bulkDelete(familyId: string, ids: string[]): Promise<{
        success: boolean;
        count: number;
    }>;
    deleteTransaction(id: string, familyId: string): Promise<{
        success: boolean;
    }>;
}
