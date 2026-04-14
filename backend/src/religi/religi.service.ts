import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReligiService {
  constructor(private prisma: PrismaService) {}

  // Prayer Times (Static for now based on common API logic or provided lat/long)
  getPrayerTimes(lat: number, lng: number) {
    // In real app, call adhan library or external API
    return {
      Subuh: "04:35",
      Syuruq: "05:50",
      Dhuhur: "11:55",
      Ashar: "15:10",
      Maghrib: "17:58",
      Isya: "19:08"
    };
  }

  // Khatam Tracker
  async updateKhatam(userId: string, juz: number) {
    const active = await this.prisma.quranKhatam.findFirst({
      where: { userId, isCompleted: false },
      orderBy: { createdAt: 'desc' }
    });

    if (active) {
      return this.prisma.quranKhatam.update({
        where: { id: active.id },
        data: { currentJuz: juz, isCompleted: juz === 30 }
      });
    }

    return this.prisma.quranKhatam.create({
      data: { userId, currentJuz: juz, isCompleted: juz === 30 }
    });
  }

  // Habit Tracker
  async logHabit(userId: string, name: string) {
    return this.prisma.islamicHabit.create({
      data: { userId, name }
    });
  }

  // Fasting Log
  async logFasting(userId: string, type: string) {
    return this.prisma.fastingLog.create({
      data: { userId, type }
    });
  }

  // Prayer Log (Sholat Tracker)
  async logPrayer(userId: string, prayerName: string, isOnTime: boolean) {
    return this.prisma.prayerLog.create({
      data: { userId, prayerName, isOnTime }
    });
  }

  // Get Summary (Streaks, XP, etc)
  async getSummary(userId: string, familyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habits = await this.prisma.islamicHabit.findMany({
      where: { userId, createdAt: { gte: today } }
    });

    const khatam = await this.prisma.quranKhatam.findFirst({
      where: { userId, isCompleted: false },
      orderBy: { createdAt: 'desc' }
    });

    const points = await this.prisma.islamicHabit.count({ where: { userId } }) * 10 
                 + await this.prisma.prayerLog.count({ where: { userId } }) * 5;

    // Family habits for leaderboard
    const familyMembers = await this.prisma.user.findMany({
      where: { familyId },
      include: {
        prayerLogs: { where: { createdAt: { gte: today } } }
      }
    });

    const scoreboard = familyMembers.map(m => ({
      name: m.name,
      progress: Math.min(100, (m.prayerLogs.length / 5) * 100),
      level: this.getLevelName(m.prayerLogs.length)
    }));

    return {
      tahajjudStreak: 7, // Placeholder logic for now
      currentJuz: khatam?.currentJuz || 0,
      habits: habits.map(h => h.name),
      familyXP: points,
      scoreboard
    };
  }

  private getLevelName(prayerCount: number) {
    if (prayerCount >= 5) return 'Prajurit Surga';
    if (prayerCount >= 3) return 'Pejuang Sholat';
    return 'Penghafal Muda';
  }

  // Islamic Events
  async getEvents() {
    return this.prisma.islamicEvent.findMany({
      orderBy: { date: 'asc' }
    });
  }
}
