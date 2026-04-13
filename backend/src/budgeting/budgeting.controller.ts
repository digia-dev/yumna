import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { BudgetingService } from './budgeting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('budgeting')
@UseGuards(JwtAuthGuard)
export class BudgetingController {
  constructor(private budgetingService: BudgetingService) {}

  @Get('status')
  async getStatus(
    @GetUser('familyId') familyId: string,
    @Query('period') period?: string,
  ) {
    const defaultPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    return this.budgetingService.getBudgetStatus(familyId, period || defaultPeriod);
  }

  @Post('set')
  async setBudget(
    @GetUser('familyId') familyId: string,
    @Body() body: { category: string; amount: number; period: string },
  ) {
    return this.budgetingService.setBudget(familyId, body.category, body.amount, body.period);
  }
}
