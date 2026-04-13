export declare class CurrencyUtil {
    static formatIDR(amount: number | string): string;
    private static rates;
    static convertToIDR(amount: number, currency: string): number;
    static roundToHundreds(amount: number): number;
    static roundToThousands(amount: number): number;
}
