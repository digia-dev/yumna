import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZakatService {
  private readonly logger = new Logger(ZakatService.name);
  
  // Benchmark Gold Price (Mocked, should be dynamic in production)
  private readonly GOLD_PRICE_PER_GRAM = 1200000; 

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate Nisab Maal based on 85g of Gold
   */
  async getNisabMaal(): Promise<number> {
    return 85 * this.GOLD_PRICE_PER_GRAM;
  }

  /**
   * Calculate Nisab Profession (Monthly) based on 653kg Grain or 85g Gold / 12
   */
  async getNisabProfession(): Promise<number> {
    return (85 * this.GOLD_PRICE_PER_GRAM) / 12;
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
   * Log Zakat payment to database
   */
  async logZakatPayment(familyId: string, amount: number, type: string) {
    const goldPrice = this.GOLD_PRICE_PER_GRAM;
    const nisab = await this.getNisabMaal();

    return this.prisma.zakatLog.create({
      data: {
        familyId,
        amount,
        type,
        nisabAtTime: nisab,
        goldPrice,
        date: new Date(),
      },
    });
  }
}
