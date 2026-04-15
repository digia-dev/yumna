import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new bill' })
  create(@Request() req: any, @Body() dto: CreateBillDto) {
    return this.billsService.create(req.user.familyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bills for family' })
  findAll(@Request() req: any) {
    return this.billsService.findAll(req.user.familyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bill details' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.billsService.findOne(id, req.user.familyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bill' })
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateBillDto,
  ) {
    return this.billsService.update(id, req.user.familyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bill (soft delete)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.billsService.remove(id, req.user.familyId);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay a bill' })
  pay(
    @Param('id') id: string,
    @Request() req: any,
    @Body('amount') amount: number,
  ) {
    return this.billsService.payBill(
      id,
      req.user.familyId,
      req.user.userId,
      amount,
    );
  }
}
