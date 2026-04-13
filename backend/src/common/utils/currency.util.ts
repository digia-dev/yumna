/**
 * Currency Utility for Yumna
 * Formats numbers into IDR (Rupiah) or other currencies.
 */

export class CurrencyUtil {
  /**
   * Format number to IDR string (e.g., Rp 1.000.000)
   */
  static formatIDR(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Mock conversion rates (to be replaced by API in production)
   */
  private static rates: Record<string, number> = {
    USD: 16000,
    SGD: 11800,
    SAR: 4200,
    EUR: 17200,
  };

  /**
   * Convert external currency to IDR
   */
  static convertToIDR(amount: number, currency: string): number {
    if (currency === 'IDR') return amount;
    const rate = this.rates[currency] || 1;
    return amount * rate;
  }

  /**
   * Round amount to nearest hundreds
   */
  static roundToHundreds(amount: number): number {
    return Math.round(amount / 100) * 100;
  }

  /**
   * Round amount to nearest thousands
   */
  static roundToThousands(amount: number): number {
    return Math.round(amount / 1000) * 1000;
  }
}
