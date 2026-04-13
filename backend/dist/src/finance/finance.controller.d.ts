import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/finance.dto';
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
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: string;
    })[]>;
    createTransaction(userId: string, familyId: string, dto: CreateTransactionDto): Promise<{
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
    deleteTransaction(id: string, familyId: string): Promise<{
        success: boolean;
    }>;
}
