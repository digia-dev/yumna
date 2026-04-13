import { PrismaService } from '../prisma/prisma.service';
export declare class ZakatService {
    private prisma;
    private readonly logger;
    private readonly GOLD_PRICE_PER_GRAM;
    constructor(prisma: PrismaService);
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
    logZakatPayment(familyId: string, amount: number, type: string): Promise<{
        id: string;
        createdAt: Date;
        familyId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        date: Date;
        nisabAtTime: import("@prisma/client-runtime-utils").Decimal;
        goldPrice: import("@prisma/client-runtime-utils").Decimal;
    }>;
}
