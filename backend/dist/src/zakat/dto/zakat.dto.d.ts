export declare class CalculateZakatDto {
    amount: number;
    type: 'MAAL' | 'PROFESSION' | 'FITRAH';
}
export declare class LogZakatDto {
    amount: number;
    type: string;
    recipient?: string;
    notes?: string;
}
