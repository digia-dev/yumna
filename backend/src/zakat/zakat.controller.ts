import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { InheritanceService } from './inheritance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CalculateZakatDto, LogZakatDto } from './dto/zakat.dto';

@Controller('zakat')
@UseGuards(JwtAuthGuard)
export class ZakatController {
  constructor(
    private zakatService: ZakatService,
    private inheritanceService: InheritanceService,
  ) {}

  @Get('nisab')
  async getNisab() {
    const maal = await this.zakatService.getNisabMaal();
    const profession = await this.zakatService.getNisabProfession();
    const silverPrice = await this.zakatService.getSilverPrice();
    const silver = 595 * silverPrice; // Nisab of Silver is 595 grams
    return { maal, profession, silver, silverPrice };
  }

  @Get('quotes')
  async getQuotes() {
    return this.zakatService.getDailyQuotes();
  }

  @Get('waqaf')
  async getWaqaf(@GetUser('familyId') familyId: string) {
    return this.zakatService.getWaqaf(familyId);
  }

  @Post('waqaf')
  async createWaqaf(@GetUser('familyId') familyId: string, @Body() data: any) {
    return this.zakatService.createWaqaf(familyId, data);
  }

  @Post('inheritance')
  async calculateWaris(@Body() data: any) {
    return this.inheritanceService.calculateInheritance(data.totalWealth, data.heirs);
  }

  @Post('calculate')
  async calculate(@Body() dto: CalculateZakatDto) {
    if (dto.type === 'MAAL') {
      return this.zakatService.calculateZakatMaal(dto.amount);
    }
    if (dto.type === 'PROFESSION') {
      return this.zakatService.calculateZakatProfession(dto.amount);
    }
    return this.zakatService.calculateZakatFitrah(Number(dto.amount));
  }

  @Get('history')
  async getHistory(@GetUser('familyId') familyId: string) {
    return this.zakatService.getZakatHistory(familyId);
  }

  @Get('reminders')
  async getReminders(@GetUser('familyId') familyId: string) {
    return this.zakatService.getZakatReminders(familyId);
  }

  @Get('haul-status')
  async getHaul(@GetUser('familyId') familyId: string) {
    return this.zakatService.checkHaulStatus(familyId);
  }

  @Post('fidyah')
  async calculateFidyah(@Body() body: { days: number }) {
    return this.zakatService.calculateFidyah(body.days);
  }

  @Post('pay')
  async distribute(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() body: any,
  ) {
    return this.zakatService.distributeZakat(userId, familyId, body);
  }

  @Post('log')
  async logPayment(
    @GetUser('familyId') familyId: string,
    @Body() dto: LogZakatDto,
  ) {
    return this.zakatService.logZakatPayment(
      familyId, 
      dto.amount, 
      dto.type, 
      (dto as any).recipient, 
      (dto as any).notes
    );
  }
}
