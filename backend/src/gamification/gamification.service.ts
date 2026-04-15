import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getBarakahData(familyId: string) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      select: { barakahScore: true, achievements: true, name: true },
    });

    if (!family) throw new NotFoundException('Family not found');

    const membersCount = await this.prisma.user.count({ where: { familyId } });
    const transactionsCount = await this.prisma.transaction.count({
      where: { familyId, isDeleted: false },
    });
    const goalsCount = await this.prisma.savingsGoal.count({
      where: { familyId },
    });

    // Simple level calculation
    const level = Math.floor(family.barakahScore / 500) + 1;
    const nextLevelExp = level * 500;
    const progress = (family.barakahScore % 500) / 5; // percentage

    return {
      name: family.name,
      score: family.barakahScore,
      level,
      progress,
      nextLevelExp,
      achievements: family.achievements || [],
      stats: {
        members: membersCount,
        transactions: transactionsCount,
        goals: goalsCount,
      },
    };
  }

  async addPoints(familyId: string, points: number, reason: string) {
    const family = await this.prisma.family.update({
      where: { id: familyId },
      data: {
        barakahScore: { increment: points },
      },
    });

    // Check for achievements
    let achievements = family.achievements as any[];
    if (!Array.isArray(achievements)) achievements = [];

    const newAchievements = [];
    if (
      family.barakahScore >= 1000 &&
      !achievements.includes('BARAKAH_BEGINNER')
    ) {
      newAchievements.push('BARAKAH_BEGINNER');
    }
    if (
      family.barakahScore >= 5000 &&
      !achievements.includes('BARAKAH_MASTER')
    ) {
      newAchievements.push('BARAKAH_MASTER');
    }

    if (newAchievements.length > 0) {
      await this.prisma.family.update({
        where: { id: familyId },
        data: {
          achievements: [...achievements, ...newAchievements],
        },
      });
    }

    return { score: family.barakahScore, newAchievements };
  }
}
