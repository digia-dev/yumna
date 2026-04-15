import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateBillDto) {
    return this.billsService.create(req.user.familyId, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.billsService.findAll(req.user.familyId);
  }

  // ── 377 Upcoming bills for auto-pay reminders ────────────────────────────
  @Get('upcoming')
  getUpcoming(
    @Request() req: any,
    @Query('days') days?: string,
  ) {
    return this.billsService.getUpcomingBills(req.user.familyId, parseInt(days ?? '7'));
  }

  // ── 377 Generate reminder notifications for all upcoming bills ───────────
  @Post('reminders/generate')
  generateReminders(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.billsService.generateAutoPayReminders(familyId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.billsService.findOne(id, req.user.familyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, req.user.familyId, dto);
  }

  // ── 377 Toggle auto-pay ──────────────────────────────────────────────────
  @Patch(':id/auto-pay')
  toggleAutoPay(@Param('id') id: string, @Request() req: any) {
    return this.billsService.toggleAutoPay(id, req.user.familyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.billsService.remove(id, req.user.familyId);
  }

  @Post(':id/pay')
  pay(
    @Param('id') id: string,
    @Request() req: any,
    @Body('amount') amount: number,
  ) {
    return this.billsService.payBill(id, req.user.familyId, req.user.userId, amount);
  }

  // ── 376 Create a task linked to a bill ───────────────────────────────────
  @Post(':id/create-task')
  createBillTask(
    @Param('id') billId: string,
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body('assigneeId') assigneeId?: string,
  ) {
    return this.billsService.createBillTask(billId, familyId, userId, assigneeId);
  }
}
