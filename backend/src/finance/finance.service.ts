import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
    metadata?: any;
  }) {
    // 1. Verify wallet belongs to family
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: data.walletId, familyId, isDeleted: false },
    });

    if (!wallet) throw new NotFoundException('Wallet not found or not in family');

    // 2. Perform transaction in a transaction block
    return this.prisma.$transaction(async (tx) => {
      // Create Transaction record
      const transaction = await tx.transaction.create({
        data: {
          ...data,
          userId,
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

      return transaction;
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
}
