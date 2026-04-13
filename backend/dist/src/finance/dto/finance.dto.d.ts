import { TransactionType } from '@prisma/client';
export declare class CreateTransactionDto {
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    walletId: string;
    metadata?: any;
}
export declare class CreateWalletDto {
    name: string;
    initialBalance?: number;
    currency?: string;
}
