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
    static parseIDR(formatted) {
        return parseInt(formatted.replace(/[^\d]/g, ''), 10);
    }
}
exports.CurrencyUtil = CurrencyUtil;
//# sourceMappingURL=currency.util.js.map