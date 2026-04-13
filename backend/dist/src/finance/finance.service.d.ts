import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getWallets(familyId: string): Promise<({
        user: {
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
    })[]>;
    createTransaction(userId: string, familyId: string, data: {
        walletId: string;
        amount: number;
        type: TransactionType;
        category: string;
        description?: string;
        metadata?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: import("@prisma/client").$Enums.TransactionType;
        category: string;
        description: string | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
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
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: import("@prisma/client").$Enums.TransactionType;
        category: string;
        description: string | null;
        date: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        walletId: string;
    })[]>;
    deleteTransaction(transactionId: string, familyId: string): Promise<{
        success: boolean;
    }>;
}
