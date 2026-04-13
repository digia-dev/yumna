"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ZakatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZakatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const redis_service_1 = require("../redis/redis.service");
const rxjs_1 = require("rxjs");
let ZakatService = ZakatService_1 = class ZakatService {
    prisma;
    http;
    redis;
    logger = new common_1.Logger(ZakatService_1.name);
    DEFAULT_GOLD_PRICE = 1200000;
    CACHE_KEY = 'gold_price_idr';
    constructor(prisma, http, redis) {
        this.prisma = prisma;
        this.http = http;
        this.redis = redis;
    }
    async getGoldPrice() {
        try {
            const cached = await this.redis.get(this.CACHE_KEY);
            if (cached)
                return Number(cached);
            const response = await (0, rxjs_1.firstValueFrom)(this.http.get('https://logammulia-api.vercel.app/prices/latest'));
            const price = response.data?.data?.[0]?.sell || this.DEFAULT_GOLD_PRICE;
            await this.redis.set(this.CACHE_KEY, price.toString(), 3600);
            return price;
        }
        catch (error) {
            this.logger.error('Failed to fetch gold price, using fallback', error);
            return this.DEFAULT_GOLD_PRICE;
        }
    }
    async getNisabMaal() {
        const goldPrice = await this.getGoldPrice();
        return 85 * goldPrice;
    }
    async getNisabProfession() {
        const goldPrice = await this.getGoldPrice();
        return (85 * goldPrice) / 12;
    }
    async calculateZakatMaal(totalWealth) {
        const nisab = await this.getNisabMaal();
        const isObligatory = totalWealth >= nisab;
        const zakatAmount = isObligatory ? totalWealth * 0.025 : 0;
        return {
            isObligatory,
            zakatAmount,
            nisab,
        };
    }
    async calculateZakatProfession(monthlyIncome) {
        const nisab = await this.getNisabProfession();
        const isObligatory = monthlyIncome >= nisab;
        const zakatAmount = isObligatory ? monthlyIncome * 0.025 : 0;
        return {
            isObligatory,
            zakatAmount,
            nisab,
        };
    }
    async calculateZakatFitrah(totalMembers, ricePricePerKg = 15000) {
        const totalRice = totalMembers * 2.5;
        const totalAmount = totalRice * ricePricePerKg;
        return {
            totalRice,
            totalAmount,
        };
    }
    async logZakatPayment(familyId, amount, type, recipient, notes) {
        const goldPrice = await this.getGoldPrice();
        const nisab = await this.getNisabMaal();
        return this.prisma.zakatLog.create({
            data: {
                familyId,
                amount,
                type,
                nisabAtTime: nisab,
                goldPrice,
                recipient,
                notes,
                date: new Date(),
            },
        });
    }
    async getZakatHistory(familyId) {
        return this.prisma.zakatLog.findMany({
            where: { familyId },
            orderBy: { date: 'desc' },
        });
    }
    async calculateFidyah(days, mealPrice = 45000) {
        const totalAmount = days * mealPrice;
        return {
            totalAmount,
            description: `Fidyah untuk ${days} hari puasa yang ditinggalkan. Setara 1 kali makan per hari (asumsi Rp ${mealPrice.toLocaleString()}/hari).`,
        };
    }
    async checkHaulStatus(familyId) {
        const nisab = await this.getNisabMaal();
        const snapshots = await this.prisma.balanceSnapshot.findMany({
            where: { familyId, amount: { gte: nisab } },
            orderBy: { date: 'asc' },
        });
        if (snapshots.length === 0)
            return { isHaulMet: false, durationDays: 0 };
        const startDate = snapshots[0].date;
        const now = new Date();
        const durationMs = now.getTime() - startDate.getTime();
        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        return {
            isHaulMet: durationDays >= 354,
            durationDays,
            startDate,
        };
    }
    async checkAndNotifyNisab(familyId, currentBalance) {
        const nisab = await this.getNisabMaal();
        if (currentBalance >= nisab) {
            const head = await this.prisma.user.findFirst({
                where: { familyId, role: 'KEPALA_KELUARGA' }
            });
            if (head) {
                await this.prisma.notification.create({
                    data: {
                        userId: head.id,
                        familyId,
                        title: '⚠️ Peringatan Nisab Terlampaui',
                        message: `Barakallah, kekayaan keluarga Anda (Rp ${currentBalance.toLocaleString()}) saat ini telah melampaui batas Nisab (Rp ${nisab.toLocaleString()}). Pantau terus selama 1 tahun (Haul) untuk kewajiban Zakat Maal.`,
                        type: 'SYSTEM',
                    },
                });
                return true;
            }
        }
        return false;
    }
    getDailyQuotes() {
        const quotes = [
            { text: "Berikanlah zakat dari hartamu, karena ia adalah pembersih bagimu.", author: "Imam Syafi'i" },
            { text: "Tangan di atas lebih baik daripada tangan di bawah.", author: "Hadits Nabi SAW" },
            { text: "Barangsiapa yang memberi pinjaman kepada Allah dengan pinjaman yang baik, maka Allah akan melipatgandakan baginya.", author: "QS. Al-Baqarah: 245" },
            { text: "Kekayaan sejati bukanlah banyaknya harta, melainkan kepuasan hati (qana'ah).", author: "Hadits Nabi SAW" },
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
    async createWaqaf(familyId, data) {
        return this.prisma.waqaf.create({
            data: {
                ...data,
                familyId,
                amount: Number(data.amount),
            },
        });
    }
    async getWaqaf(familyId) {
        return this.prisma.waqaf.findMany({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getSilverPrice() {
        const goldPrice = await this.getGoldPrice();
        return goldPrice * 0.015;
    }
    async getZakatReminders(familyId) {
        const now = new Date();
        const isBeginningOfMonth = now.getDate() <= 7;
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const existingLog = await this.prisma.zakatLog.findFirst({
            where: {
                familyId,
                type: 'PROFESSION',
                date: { gte: startOfMonth }
            }
        });
        const reminders = [];
        if (isBeginningOfMonth && !existingLog) {
            reminders.push({
                type: 'MONTHLY_PROFESSION',
                title: 'Zakat Profesi Bulanan',
                message: 'Sudahkah Anda menyisihkan zakat profesi bulan ini?',
                action: '/dashboard/zakat'
            });
        }
        return reminders;
    }
};
exports.ZakatService = ZakatService;
exports.ZakatService = ZakatService = ZakatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        redis_service_1.RedisService])
], ZakatService);
//# sourceMappingURL=zakat.service.js.map