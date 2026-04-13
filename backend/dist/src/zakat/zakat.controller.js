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
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const zakat_dto_1 = require("./dto/zakat.dto");
let ZakatController = class ZakatController {
    zakatService;
    constructor(zakatService) {
        this.zakatService = zakatService;
    }
    async getNisab() {
        const maal = await this.zakatService.getNisabMaal();
        const profession = await this.zakatService.getNisabProfession();
        return { maal, profession };
    }
    async calculate(dto) {
        if (dto.type === 'MAAL') {
            return this.zakatService.calculateZakatMaal(dto.amount);
        }
        return this.zakatService.calculateZakatProfession(dto.amount);
    }
    async logPayment(familyId, dto) {
        return this.zakatService.logZakatPayment(familyId, dto.amount, dto.type);
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
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zakat_dto_1.CalculateZakatDto]),
    __metadata("design:returntype", Promise)
], ZakatController.prototype, "calculate", null);
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
    __metadata("design:paramtypes", [zakat_service_1.ZakatService])
], ZakatController);
//# sourceMappingURL=zakat.controller.js.map