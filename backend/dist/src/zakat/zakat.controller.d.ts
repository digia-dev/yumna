import { ZakatService } from './zakat.service';
import { InheritanceService } from './inheritance.service';
import { CalculateZakatDto, LogZakatDto } from './dto/zakat.dto';
export declare class ZakatController {
    private zakatService;
    private inheritanceService;
    constructor(zakatService: ZakatService, inheritanceService: InheritanceService);
    getNisab(): Promise<{
        maal: number;
        profession: number;
        silver: number;
        silverPrice: number;
    }>;
    getQuotes(): Promise<{
        text: string;
        author: string;
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
    createWaqaf(familyId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        familyId: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
    }>;
    calculateWaris(data: any): Promise<{
        totalDistributed: number;
        shares: Record<string, number>;
        remaining: number;
    }>;
    calculate(dto: CalculateZakatDto): Promise<{
        isObligatory: boolean;
        zakatAmount: number;
        nisab: number;
    } | {
        totalRice: number;
        totalAmount: number;
    }>;
    getHistory(familyId: string): Promise<{
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
    getReminders(familyId: string): Promise<{
        type: string;
        title: string;
        message: string;
        action: string;
    }[]>;
    getHaul(familyId: string): Promise<{
        isHaulMet: boolean;
        durationDays: number;
        startDate?: Date;
        nisabAtStart?: number;
    }>;
    calculateFidyah(body: {
        days: number;
    }): Promise<{
        totalAmount: number;
        description: string;
    }>;
    distribute(userId: string, familyId: string, body: any): Promise<{
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
    logPayment(familyId: string, dto: LogZakatDto): Promise<{
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
}
