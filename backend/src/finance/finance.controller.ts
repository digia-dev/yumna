import { Controller, Get, Post, Body, UseGuards, Put, Param, Delete, Query, Res, Patch } from '@nestjs/common';
import type { Response } from 'express';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateTransactionDto, CreateWalletDto } from './dto/finance.dto';
import { TransactionType } from '@prisma/client';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('wallets')
  async getWallets(@GetUser('familyId') familyId: string) {
    return this.financeService.getWallets(familyId);
  }

  @Post('wallets')
  async createWallet(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateWalletDto,
  ) {
    return this.financeService.createWallet(userId, familyId, dto);
  }

  @Put('wallets/:id')
  async updateWallet(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: Partial<CreateWalletDto>,
  ) {
    return this.financeService.updateWallet(id, familyId, dto);
  }

  @Delete('wallets/:id')
  async deleteWallet(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.financeService.deleteWallet(id, familyId);
  }

  @Post('transactions')
  async createTransaction(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.financeService.createTransaction(userId, familyId, dto);
  }

  @Get('debts')
  async getDebts(@GetUser('familyId') familyId: string) {
    return this.financeService.getDebts(familyId);
  }

  @Post('debts')
  async createDebt(
    @GetUser('familyId') familyId: string,
    @Body() body: any,
  ) {
    return this.financeService.createDebt(familyId, body);
  }

  @Patch('debts/:id/toggle')
  async toggleDebt(
    @GetUser('familyId') familyId: string,
    @Param('id') id: string,
  ) {
    return this.financeService.toggleDebtPaid(familyId, id);
  }

  @Get('categories')
  async getCategories(@GetUser('familyId') familyId: string) {
    return this.financeService.getCategories(familyId);
  }

  @Post('categories')
  async createCategory(
    @GetUser('familyId') familyId: string,
    @Body() body: { name: string; type?: TransactionType; icon?: string },
  ) {
    return this.financeService.createCategory(familyId, body.name, body.type, body.icon);
  }

  @Delete('categories/:id')
  async deleteCategory(
    @GetUser('familyId') familyId: string,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteCategory(familyId, id);
  }

  @Post('quick-add')
  async quickAdd(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() data: any,
  ) {
    return this.financeService.quickAddTransaction(userId, familyId, data);
  }

  @Get('transactions')
  async getTransactions(@GetUser('familyId') familyId: string) {
    return this.financeService.getTransactions(familyId);
  }

  @Get('summary')
  async getSummary(
    @GetUser('familyId') familyId: string,
    @Query('month') month?: string,
  ) {
    return this.financeService.getFinancialSummary(familyId, month);
  }

  @Get('top-categories')
  async getTopCategories(
    @GetUser('familyId') familyId: string,
    @Query('limit') limit?: number,
  ) {
    return this.financeService.getTopCategories(familyId, limit);
  }

  @Get('health-score')
  async getHealth(@GetUser('familyId') familyId: string) {
    return this.financeService.getHealthScore(familyId);
  }

  @Get('budgeting/unallocated')
  async getUnallocated(@GetUser('familyId') familyId: string) {
    return this.financeService.getUnallocatedFunds(familyId);
  }

  @Get('debug/perf-test')
  async runPerfTest(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
  ) {
    const startTime = Date.now();
    const result = await this.financeService.runPerformanceTest(userId, familyId);
    const endTime = Date.now();
    return { ...result, totalExecutionTime: endTime - startTime };
  }

  @Post('wallets/:id/import')
  async importTransactions(
    @Param('id') walletId: string,
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() body: { transactions: any[] },
  ) {
    return this.financeService.bulkImportTransactions(userId, familyId, walletId, body.transactions);
  }

  @Get('transactions/export')
  async exportTransactions(
    @GetUser('familyId') familyId: string,
    @Res() res: Response,
  ) {
    const csv = await this.financeService.exportTransactionsToCSV(familyId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    return res.status(200).send(csv);
  }

  @Get('charts/cash-flow')
  async getCashFlow(@GetUser('familyId') familyId: string) {
    return this.financeService.getCashFlow(familyId);
  }

  @Get('charts/category-spending')
  async getCategorySpending(
    @GetUser('familyId') familyId: string,
    @Query('month') month?: string,
  ) {
    return this.financeService.getCategorySpending(familyId, month);
  }

  @Post('transfer')
  async transfer(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() body: { fromWalletId: string; toWalletId: string; amount: number; description?: string },
  ) {
    return this.financeService.transferBetweenWallets(userId, familyId, body);
  }

  @Put('transactions/:id')
  async updateTransaction(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
    @Body() body: any,
  ) {
    return this.financeService.updateTransaction(id, familyId, body);
  }

  @Delete('transactions/bulk')
  async bulkDelete(
    @GetUser('familyId') familyId: string,
    @Body('ids') ids: string[],
  ) {
    return this.financeService.bulkDeleteTransactions(ids, familyId);
  }

  @Delete('transactions/:id')
  async deleteTransaction(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.financeService.deleteTransaction(id, familyId);
  }

  // --- Savings Goals ---
  @Get('savings-goals')
  async getSavingsGoals(@GetUser('familyId') familyId: string) {
    return this.financeService.getSavingsGoals(familyId);
  }

  @Post('savings-goals')
  async createSavingsGoal(
    @GetUser('familyId') familyId: string,
    @Body() dto: any,
  ) {
    return this.financeService.createSavingsGoal(familyId, dto);
  }

  @Put('savings-goals/:id')
  async updateSavingsGoal(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: any,
  ) {
    return this.financeService.updateSavingsGoal(id, familyId, dto);
  }

  @Delete('savings-goals/:id')
  async deleteSavingsGoal(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.financeService.deleteSavingsGoal(id, familyId);
  }

  @Get('wealth-breakdown')
  async getWealthBreakdown(@GetUser('familyId') familyId: string) {
    return this.financeService.getWealthBreakdown(familyId);
  }

  @Get('comparative-analytics')
  async getComparativeAnalytics(@GetUser('familyId') familyId: string) {
    return this.financeService.getComparativeAnalytics(familyId);
  }
}
