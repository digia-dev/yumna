import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CalculateZakatDto, LogZakatDto } from './dto/zakat.dto';

@Controller('zakat')
@UseGuards(JwtAuthGuard)
export class ZakatController {
  constructor(private zakatService: ZakatService) {}

  @Get('nisab')
  async getNisab() {
    const maal = await this.zakatService.getNisabMaal();
    const profession = await this.zakatService.getNisabProfession();
    return { maal, profession };
  }

  @Post('calculate')
  async calculate(@Body() dto: CalculateZakatDto) {
    if (dto.type === 'MAAL') {
      return this.zakatService.calculateZakatMaal(dto.amount);
    }
    return this.zakatService.calculateZakatProfession(dto.amount);
  }

  @Post('log')
  async logPayment(
    @GetUser('familyId') familyId: string,
    @Body() dto: LogZakatDto,
  ) {
    return this.zakatService.logZakatPayment(familyId, dto.amount, dto.type);
  }
}
