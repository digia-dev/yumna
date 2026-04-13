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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWallets(familyId) {
        return this.prisma.wallet.findMany({
            where: { familyId, isDeleted: false },
            include: { user: { select: { name: true, role: true } } },
        });
    }
    async createTransaction(userId, familyId, data) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: data.walletId, familyId, isDeleted: false },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found or not in family');
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId,
                },
            });
            const balanceChange = data.type === client_1.TransactionType.INCOME ? data.amount : -data.amount;
            await tx.wallet.update({
                where: { id: data.walletId },
                data: {
                    balance: { increment: balanceChange },
                },
            });
            return transaction;
        });
    }
    async getTransactions(familyId, limit = 20) {
        return this.prisma.transaction.findMany({
            where: {
                wallet: { familyId },
                isDeleted: false,
            },
            include: {
                user: { select: { name: true } },
                wallet: { select: { name: true } },
            },
            orderBy: { date: 'desc' },
            take: limit,
        });
    }
    async deleteTransaction(transactionId, familyId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId, wallet: { familyId } },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.transaction.update({
                where: { id: transactionId },
                data: { isDeleted: true, deletedAt: new Date() },
            });
            const revertAmount = transaction.type === client_1.TransactionType.INCOME
                ? -Number(transaction.amount)
                : Number(transaction.amount);
            await tx.wallet.update({
                where: { id: transaction.walletId },
                data: { balance: { increment: revertAmount } },
            });
            return { success: true };
        });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map