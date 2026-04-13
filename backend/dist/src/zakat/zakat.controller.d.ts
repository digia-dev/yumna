import { ZakatService } from './zakat.service';
import { CalculateZakatDto, LogZakatDto } from './dto/zakat.dto';
export declare class ZakatController {
    private zakatService;
    constructor(zakatService: ZakatService);
    getNisab(): Promise<{
        maal: number;
        profession: number;
    }>;
    calculate(dto: CalculateZakatDto): Promise<{
        isObligatory: boolean;
        zakatAmount: number;
        nisab: number;
    }>;
    logPayment(familyId: string, dto: LogZakatDto): Promise<{
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
