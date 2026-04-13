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
   * Parse IDR string back to number
   */
  static parseIDR(formatted: string): number {
    return parseInt(formatted.replace(/[^\d]/g, ''), 10);
  }
}
