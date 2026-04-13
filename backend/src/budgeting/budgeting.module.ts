import { Module } from '@nestjs/common';
import { BudgetingController } from './budgeting.controller';
import { BudgetingService } from './budgeting.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetingController],
  providers: [BudgetingService],
  exports: [BudgetingService],
})
export class BudgetingModule {}
