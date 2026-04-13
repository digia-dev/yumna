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
let ZakatService = ZakatService_1 = class ZakatService {
    prisma;
    logger = new common_1.Logger(ZakatService_1.name);
    GOLD_PRICE_PER_GRAM = 1200000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNisabMaal() {
        return 85 * this.GOLD_PRICE_PER_GRAM;
    }
    async getNisabProfession() {
        return (85 * this.GOLD_PRICE_PER_GRAM) / 12;
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
    async logZakatPayment(familyId, amount, type) {
        const goldPrice = this.GOLD_PRICE_PER_GRAM;
        const nisab = await this.getNisabMaal();
        return this.prisma.zakatLog.create({
            data: {
                familyId,
                amount,
                type,
                nisabAtTime: nisab,
                goldPrice,
                date: new Date(),
            },
        });
    }
};
exports.ZakatService = ZakatService;
exports.ZakatService = ZakatService = ZakatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZakatService);
//# sourceMappingURL=zakat.service.js.map