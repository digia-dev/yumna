import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '../redis/redis.service';
export declare class ZakatService {
    private prisma;
    private http;
    private redis;
    private readonly logger;
    private DEFAULT_GOLD_PRICE;
    private CACHE_KEY;
    constructor(prisma: PrismaService, http: HttpService, redis: RedisService);
    getGoldPrice(): Promise<number>;
    getNisabMaal(): Promise<number>;
    getNisabProfession(): Promise<number>;
    calculateZakatMaal(totalWealth: number): Promise<{
        isObligatory: boolean;
        zakatAmount: number;
        nisab: number;
    }>;
    calculateZakatProfession(monthlyIncome: number): Promise<{
        isObligatory: boolean;
        zakatAmount: number;
        nisab: number;
    }>;
    calculateZakatFitrah(totalMembers: number, ricePricePerKg?: number): Promise<{
        totalRice: number;
        totalAmount: number;
    }>;
    logZakatPayment(familyId: string, amount: number, type: string, recipient?: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        familyId: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
        nisabAtTime: import("@prisma/client-runtime-utils").Decimal;
        goldPrice: import("@prisma/client-runtime-utils").Decimal;
        recipient: string | null;
        notes: string | null;
    }>;
    distributeZakat(userId: string, familyId: string, data: {
        walletId: string;
        amount: number;
        type: string;
        recipient: string;
        notes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        familyId: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
        nisabAtTime: import("@prisma/client-runtime-utils").Decimal;
        goldPrice: import("@prisma/client-runtime-utils").Decimal;
        recipient: string | null;
        notes: string | null;
    }>;
    getZakatHistory(familyId: string): Promise<{
        id: string;
        createdAt: Date;
        familyId: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
        nisabAtTime: import("@prisma/client-runtime-utils").Decimal;
        goldPrice: import("@prisma/client-runtime-utils").Decimal;
        recipient: string | null;
        notes: string | null;
    }[]>;
    calculateFidyah(days: number, mealPrice?: number): Promise<{
        totalAmount: number;
        description: string;
    }>;
    checkHaulStatus(familyId: string): Promise<{
        isHaulMet: boolean;
        durationDays: number;
        startDate?: Date;
        nisabAtStart?: number;
    }>;
    checkAndNotifyNisab(familyId: string, currentBalance: number): Promise<boolean>;
    getDailyQuotes(): {
        text: string;
        author: string;
    };
    createWaqaf(familyId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
    }>;
    getWaqaf(familyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
    }[]>;
    getSilverPrice(): Promise<number>;
    getZakatReminders(familyId: string): Promise<{
        type: string;
        title: string;
        message: string;
        action: string;
    }[]>;
}
