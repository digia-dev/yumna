"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyUtil = void 0;
class CurrencyUtil {
    static formatIDR(amount) {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
    static rates = {
        USD: 16000,
        SGD: 11800,
        SAR: 4200,
        EUR: 17200,
    };
    static convertToIDR(amount, currency) {
        if (currency === 'IDR')
            return amount;
        const rate = this.rates[currency] || 1;
        return amount * rate;
    }
    static roundToHundreds(amount) {
        return Math.round(amount / 100) * 100;
    }
    static roundToThousands(amount) {
        return Math.round(amount / 1000) * 1000;
    }
}
exports.CurrencyUtil = CurrencyUtil;
//# sourceMappingURL=currency.util.js.map