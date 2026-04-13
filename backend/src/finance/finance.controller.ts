import { Controller, Get, Post, Body, UseGuards, Delete, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateTransactionDto, CreateWalletDto } from './dto/finance.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('wallets')
  async getWallets(@GetUser('familyId') familyId: string) {
    return this.financeService.getWallets(familyId);
  }

  @Post('transactions')
  async createTransaction(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.financeService.createTransaction(userId, familyId, dto);
  }

  @Get('transactions')
  async getTransactions(@GetUser('familyId') familyId: string) {
    return this.financeService.getTransactions(familyId);
  }

  @Delete('transactions/:id')
  async deleteTransaction(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.financeService.deleteTransaction(id, familyId);
  }
}
