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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZakatController = void 0;
const common_1 = require("@nestjs/common");
const zakat_service_1 = require("./zakat.service");
const inheritance_service_1 = require("./inheritance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const zakat_dto_1 = require("./dto/zakat.dto");
let ZakatController = class ZakatController {
    zakatService;
    inheritanceService;
    constructor(zakatService, inheritanceService) {
        this.zakatService = zakatService;
        this.inheritanceService = inheritanceService;
    }
    async getNisab() {
        const maal = await this.zakatService.getNisabMaal();
        const profession = await this.zakatService.getNisabProfession();
        const silverPrice = await this.zakatService.getSilverPrice();
        const silver = 595 * silverPrice;
        return { maal, profession, silver, silverPrice };
    }
    async getQuotes() {
        return this.zakatService.getDailyQuotes();
    }
    async getWaqaf(familyId) {
        return this.zakatService.getWaqaf(familyId);
    }
    async createWaqaf(familyId, data) {
        return this.zakatService.createWaqaf(familyId, data);
    }
    async calculateWaris(data) {
        return this.inheritanceService.calculateInheritance(data.totalWealth, data.heirs);
    }
    async calculate(dto) {
        if (dto.type === 'MAAL') {
            return this.zakatService.calculateZakatMaal(dto.amount);
        }
        if (dto.type === 'PROFESSION') {
            return this.zakatService.calculateZakatProfession(dto.amount);
        }
        return this.zakatService.calculateZakatFitrah(Number(dto.amount));
    }
    async getHistory(familyId) {
        return this.zakatService.getZakatHistory(familyId);
    }
    async getReminders(familyId) {
        return this.zakatService.getZakatReminders(familyId);
    }
    async getHaul(familyId) {
        return this.zakatService.checkHaulStatus(familyId);
    }
    async calculateFidyah(body) {
        return this.zakatService.calculateFidyah(body.days);
    }
    async logPayment(familyId, dto) {
        return this.zakatService.logZakatPayment(familyId, dto.amount, dto.type, dto.recipient, dto.notes);
    }
};
exports.ZakatController = ZakatController;
__decorate([
    (0, common_1.Get)('nisab'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "getNisab", null);
__decorate([
    (0, common_1.Get)('quotes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "getQuotes", null);
__decorate([
    (0, common_1.Get)('waqaf'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "getWaqaf", null);
__decorate([
    (0, common_1.Post)('waqaf'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "createWaqaf", null);
__decorate([
    (0, common_1.Post)('inheritance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "calculateWaris", null);
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zakat_dto_1.CalculateZakatDto]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('reminders'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "getReminders", null);
__decorate([
    (0, common_1.Get)('haul-status'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "getHaul", null);
__decorate([
    (0, common_1.Post)('fidyah'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "calculateFidyah", null);
__decorate([
    (0, common_1.Post)('log'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, zakat_dto_1.LogZakatDto]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "logPayment", null);
exports.ZakatController = ZakatController = __decorate([
    (0, common_1.Controller)('zakat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [zakat_service_1.ZakatService,
        inheritance_service_1.InheritanceService])
], ZakatController);
//# sourceMappingURL=zakat.controller.js.map