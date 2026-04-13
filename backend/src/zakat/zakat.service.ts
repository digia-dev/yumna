import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '../redis/redis.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZakatService {
  private readonly logger = new Logger(ZakatService.name);
  
  // Default fallback if API fails
  private DEFAULT_GOLD_PRICE = 1200000; 
  private CACHE_KEY = 'gold_price_idr';

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private redis: RedisService,
  ) {}

  /**
   * Get Current Gold Price (IDR per gram)
   */
  async getGoldPrice(): Promise<number> {
    try {
      // 1. Try cache
      const cached = await this.redis.get(this.CACHE_KEY);
      if (cached) return Number(cached);

      // 2. Fetch from API (Example API)
      // Note: This URL might need updating based on the actual available public API
      const response = await firstValueFrom(
        this.http.get('https://logammulia-api.vercel.app/prices/latest')
      );
      
      const price = response.data?.data?.[0]?.sell || this.DEFAULT_GOLD_PRICE;
      
      // 3. Cache for 1 hour
      await this.redis.set(this.CACHE_KEY, price.toString(), 3600);
      
      return price;
    } catch (error) {
      this.logger.error('Failed to fetch gold price, using fallback', error);
      return this.DEFAULT_GOLD_PRICE;
    }
  }

  /**
   * Calculate Nisab Maal based on 85g of Gold
   */
  async getNisabMaal(): Promise<number> {
    const goldPrice = await this.getGoldPrice();
    return 85 * goldPrice;
  }

  /**
   * Calculate Nisab Profession (Monthly) based on 653kg Grain or 85g Gold / 12
   */
  async getNisabProfession(): Promise<number> {
    const goldPrice = await this.getGoldPrice();
    return (85 * goldPrice) / 12;
  }

  /**
   * Calculate Zakat Maal (Wealth)
   */
  async calculateZakatMaal(totalWealth: number): Promise<{
    isObligatory: boolean;
    zakatAmount: number;
    nisab: number;
  }> {
    const nisab = await this.getNisabMaal();
    const isObligatory = totalWealth >= nisab;
    const zakatAmount = isObligatory ? totalWealth * 0.025 : 0;

    return {
      isObligatory,
      zakatAmount,
      nisab,
    };
  }

  /**
   * Calculate Zakat Profession (Income)
   */
  async calculateZakatProfession(monthlyIncome: number): Promise<{
    isObligatory: boolean;
    zakatAmount: number;
    nisab: number;
  }> {
    const nisab = await this.getNisabProfession();
    const isObligatory = monthlyIncome >= nisab;
    const zakatAmount = isObligatory ? monthlyIncome * 0.025 : 0;

    return {
      isObligatory,
      zakatAmount,
      nisab,
    };
  }
  /**
   * Calculate Zakat Fitrah (Based on family members)
   */
  async calculateZakatFitrah(totalMembers: number, ricePricePerKg = 15000): Promise<{
    totalRice: number;
    totalAmount: number;
  }> {
    const totalRice = totalMembers * 2.5;
    const totalAmount = totalRice * ricePricePerKg;

    return {
      totalRice,
      totalAmount,
    };
  }

  /**
   * Log Zakat payment to database with distribution details
   */
  async logZakatPayment(familyId: string, amount: number, type: string, recipient?: string, notes?: string) {
    const goldPrice = await this.getGoldPrice();
    const nisab = await this.getNisabMaal();

    return this.prisma.zakatLog.create({
      data: {
        familyId,
        amount,
        type,
        nisabAtTime: nisab,
        goldPrice,
        recipient,
        notes,
        date: new Date(),
      },
    });
  }

  /**
   * Get Zakat logs for a family
   */
  async getZakatHistory(familyId: string) {
    return this.prisma.zakatLog.findMany({
      where: { familyId },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Calculate Fidyah and Kaffarah
   */
  async calculateFidyah(days: number, mealPrice = 45000): Promise<{
    totalAmount: number;
    description: string;
  }> {
    const totalAmount = days * mealPrice;
    return {
      totalAmount,
      description: `Fidyah untuk ${days} hari puasa yang ditinggalkan. Setara 1 kali makan per hari (asumsi Rp ${mealPrice.toLocaleString()}/hari).`,
    };
  }

  /**
   * Haul Tracker: Check if wealth has been above Nisab for 1 year
   */
  async checkHaulStatus(familyId: string): Promise<{
    isHaulMet: boolean;
    durationDays: number;
    startDate?: Date;
    nisabAtStart?: number;
  }> {
    const nisab = await this.getNisabMaal();
    
    // Find earliest snapshot where balance >= current Nisab
    // In a real scenario, we'd check if it STAYED above Nisab continuously
    const snapshots = await this.prisma.balanceSnapshot.findMany({
      where: { familyId, amount: { gte: nisab } },
      orderBy: { date: 'asc' },
    });

    if (snapshots.length === 0) return { isHaulMet: false, durationDays: 0 };

    const startDate = snapshots[0].date;
    const now = new Date();
    const durationMs = now.getTime() - startDate.getTime();
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    
    return {
      isHaulMet: durationDays >= 354, // Lunar year is approx 354 days
      durationDays,
      startDate,
    };
  }

  /**
   * Check for Nisab Alert and notify
   */
  async checkAndNotifyNisab(familyId: string, currentBalance: number) {
    const nisab = await this.getNisabMaal();
    if (currentBalance >= nisab) {
      // Notify Kepala Keluarga
      const head = await this.prisma.user.findFirst({
        where: { familyId, role: 'KEPALA_KELUARGA' }
      });

      if (head) {
        await this.prisma.notification.create({
          data: {
            userId: head.id,
            familyId,
            title: '⚠️ Peringatan Nisab Terlampaui',
            message: `Barakallah, kekayaan keluarga Anda (Rp ${currentBalance.toLocaleString()}) saat ini telah melampaui batas Nisab (Rp ${nisab.toLocaleString()}). Pantau terus selama 1 tahun (Haul) untuk kewajiban Zakat Maal.`,
            type: 'SYSTEM',
          },
        });
        return true;
      }
    }
    return false;
  }

  /**
   * Get Daily Islamic Finance Quotes
   */
  getDailyQuotes() {
    const quotes = [
      { text: "Berikanlah zakat dari hartamu, karena ia adalah pembersih bagimu.", author: "Imam Syafi'i" },
      { text: "Tangan di atas lebih baik daripada tangan di bawah.", author: "Hadits Nabi SAW" },
      { text: "Barangsiapa yang memberi pinjaman kepada Allah dengan pinjaman yang baik, maka Allah akan melipatgandakan baginya.", author: "QS. Al-Baqarah: 245" },
      { text: "Kekayaan sejati bukanlah banyaknya harta, melainkan kepuasan hati (qana'ah).", author: "Hadits Nabi SAW" },
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  /**
   * Waqaf Tracking
   */
  async createWaqaf(familyId: string, data: any) {
    return this.prisma.waqaf.create({
      data: {
        ...data,
        familyId,
        amount: Number(data.amount),
      },
    });
  }

  async getWaqaf(familyId: string) {
    return this.prisma.waqaf.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Silver Price (Estimation if API not available)
   */
  async getSilverPrice(): Promise<number> {
    const goldPrice = await this.getGoldPrice();
    return goldPrice * 0.015; // Rough market ratio fallback
  }

  /**
   * Get Zakat Reminders for dashboard
   */
  async getZakatReminders(familyId: string) {
    const now = new Date();
    const isBeginningOfMonth = now.getDate() <= 7;
    
    // Check if profession zakat logged this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const existingLog = await this.prisma.zakatLog.findFirst({
      where: {
        familyId,
        type: 'PROFESSION',
        date: { gte: startOfMonth }
      }
    });

    const reminders = [];
    if (isBeginningOfMonth && !existingLog) {
      reminders.push({
        type: 'MONTHLY_PROFESSION',
        title: 'Zakat Profesi Bulanan',
        message: 'Sudahkah Anda menyisihkan zakat profesi bulan ini?',
        action: '/dashboard/zakat'
      });
    }

    return reminders;
  }
}
