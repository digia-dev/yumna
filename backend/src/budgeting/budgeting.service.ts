import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class BudgetingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get budgets and actual spending for a family and period
   */
  async getBudgetStatus(familyId: string, period: string) {
    // 1. Get all budgets for the period
    const budgets = await this.prisma.budget.findMany({
      where: { familyId, period },
    });

    // 2. Get actual spending for the period
    // We assume period is "YYYY-MM"
    const startDate = new Date(`${period}-01`);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    );
    endDate.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        familyId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
    });

    // 3. Aggregate spending by category
    const spendingByCategory = transactions.reduce(
      (acc, curr) => {
        const category = curr.category;
        acc[category] = (acc[category] || 0) + Number(curr.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    // 4. Combine data
    const result = budgets.map((b) => ({
      category: b.category,
      limit: Number(b.amount),
      spent: spendingByCategory[b.category] || 0,
      remaining: Math.max(
        0,
        Number(b.amount) - (spendingByCategory[b.category] || 0),
      ),
      percentage: Math.min(
        100,
        ((spendingByCategory[b.category] || 0) / Number(b.amount)) * 100,
      ),
    }));

    // 5. Add categories that have spending but no budget
    Object.keys(spendingByCategory).forEach((cat) => {
      if (!budgets.find((b) => b.category === cat)) {
        result.push({
          category: cat,
          limit: 0,
          spent: spendingByCategory[cat],
          remaining: 0,
          percentage: 100,
        });
      }
    });

    return result;
  }

  /**
   * Set or update a budget
   */
  async setBudget(
    familyId: string,
    category: string,
    amount: number,
    period: string,
  ) {
    return this.prisma.budget.upsert({
      where: {
        familyId_category_period: {
          familyId,
          category,
          period,
        },
      },
      update: { amount },
      create: {
        familyId,
        category,
        amount,
        period,
      },
    });
  }

  async deleteBudget(familyId: string, id: string) {
    return this.prisma.budget.delete({
      where: { id, familyId },
    });
  }
}
