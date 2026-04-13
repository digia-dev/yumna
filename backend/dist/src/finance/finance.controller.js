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
    async createWallet(userId, familyId, dto) {
        return this.financeService.createWallet(userId, familyId, dto);
    }
    async updateWallet(id, familyId, dto) {
        return this.financeService.updateWallet(id, familyId, dto);
    }
    async deleteWallet(id, familyId) {
        return this.financeService.deleteWallet(id, familyId);
    }
    async createTransaction(userId, familyId, dto) {
        return this.financeService.createTransaction(userId, familyId, dto);
    }
    async getDebts(familyId) {
        return this.financeService.getDebts(familyId);
    }
    async createDebt(familyId, body) {
        return this.financeService.createDebt(familyId, body);
    }
    async toggleDebt(familyId, id) {
        return this.financeService.toggleDebtPaid(familyId, id);
    }
    async getCategories(familyId) {
        return this.financeService.getCategories(familyId);
    }
    async createCategory(familyId, body) {
        return this.financeService.createCategory(familyId, body.name, body.type, body.icon);
    }
    async deleteCategory(familyId, id) {
        return this.financeService.deleteCategory(familyId, id);
    }
    async quickAdd(userId, familyId, data) {
        return this.financeService.quickAddTransaction(userId, familyId, data);
    }
    async getTransactions(familyId) {
        return this.financeService.getTransactions(familyId);
    }
    async getSummary(familyId, month) {
        return this.financeService.getFinancialSummary(familyId, month);
    }
    async getTopCategories(familyId, limit) {
        return this.financeService.getTopCategories(familyId, limit);
    }
    async getHealth(familyId) {
        return this.financeService.getHealthScore(familyId);
    }
    async getUnallocated(familyId) {
        return this.financeService.getUnallocatedFunds(familyId);
    }
    async runPerfTest(userId, familyId) {
        const startTime = Date.now();
        const result = await this.financeService.runPerformanceTest(userId, familyId);
        const endTime = Date.now();
        return { ...result, totalExecutionTime: endTime - startTime };
    }
    async importTransactions(walletId, userId, familyId, body) {
        return this.financeService.bulkImportTransactions(userId, familyId, walletId, body.transactions);
    }
    async exportTransactions(familyId, res) {
        const csv = await this.financeService.exportTransactionsToCSV(familyId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        return res.status(200).send(csv);
    }
    async getCashFlow(familyId) {
        return this.financeService.getCashFlow(familyId);
    }
    async getCategorySpending(familyId, month) {
        return this.financeService.getCategorySpending(familyId, month);
    }
    async transfer(userId, familyId, body) {
        return this.financeService.transferBetweenWallets(userId, familyId, body);
    }
    async updateTransaction(id, familyId, body) {
        return this.financeService.updateTransaction(id, familyId, body);
    }
    async bulkDelete(familyId, ids) {
        return this.financeService.bulkDeleteTransactions(ids, familyId);
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
    (0, common_1.Post)('wallets'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, finance_dto_1.CreateWalletDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Put)('wallets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "updateWallet", null);
__decorate([
    (0, common_1.Delete)('wallets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "deleteWallet", null);
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
    (0, common_1.Get)('debts'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getDebts", null);
__decorate([
    (0, common_1.Post)('debts'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createDebt", null);
__decorate([
    (0, common_1.Patch)('debts/:id/toggle'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "toggleDebt", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('quick-add'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "quickAdd", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('top-categories'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getTopCategories", null);
__decorate([
    (0, common_1.Get)('health-score'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('budgeting/unallocated'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getUnallocated", null);
__decorate([
    (0, common_1.Get)('debug/perf-test'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "runPerfTest", null);
__decorate([
    (0, common_1.Post)('wallets/:id/import'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "importTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/export'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "exportTransactions", null);
__decorate([
    (0, common_1.Get)('charts/cash-flow'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getCashFlow", null);
__decorate([
    (0, common_1.Get)('charts/category-spending'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getCategorySpending", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "transfer", null);
__decorate([
    (0, common_1.Put)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Delete)('transactions/bulk'),
    __param(0, (0, get_user_decorator_1.GetUser)('familyId')),
    __param(1, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "bulkDelete", null);
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