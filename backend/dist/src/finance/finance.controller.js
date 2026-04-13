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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const finance_service_1 = require("./finance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const finance_dto_1 = require("./dto/finance.dto");
let FinanceController = class FinanceController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    async getWallets(familyId) {
        return this.financeService.getWallets(familyId);
    }
    async createTransaction(userId, familyId, dto) {
        return this.financeService.createTransaction(userId, familyId, dto);
    }
    async getTransactions(familyId) {
        return this.financeService.getTransactions(familyId);
    }
    async deleteTransaction(id, familyId) {
        return this.financeService.deleteTransaction(id, familyId);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('wallets'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getWallets", null);
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, finance_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Delete)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "deleteTransaction", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map