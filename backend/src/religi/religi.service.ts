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
    return this.prisma.quranKhatam.upsert({
      where: { id: userId }, // Simplified: 1 active khatam per user
      update: { currentJuz: juz, isCompleted: juz === 30 },
      create: { userId, currentJuz: juz, isCompleted: juz === 30 }
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

  // Islamic Events
  async getEvents() {
    return this.prisma.islamicEvent.findMany({
      orderBy: { date: 'asc' }
    });
  }
}
