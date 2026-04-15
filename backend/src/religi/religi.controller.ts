import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ReligiService } from './religi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('religi')
@UseGuards(JwtAuthGuard)
export class ReligiController {
  constructor(private religiService: ReligiService) {}

  @Get('prayer-times')
  async getPrayerTimes(@Query('lat') lat: number, @Query('lng') lng: number) {
    return this.religiService.getPrayerTimes(lat || -6.2088, lng || 106.8456); // Default Jakarta
  }

  @Post('khatam')
  async updateKhatam(
    @GetUser('id') userId: string,
    @Body() body: { juz: number },
  ) {
    return this.religiService.updateKhatam(userId, body.juz);
  }

  @Post('habit')
  async logHabit(
    @GetUser('id') userId: string,
    @Body() body: { name: string },
  ) {
    return this.religiService.logHabit(userId, body.name);
  }

  @Post('fasting')
  async logFasting(
    @GetUser('id') userId: string,
    @Body() body: { type: string },
  ) {
    return this.religiService.logFasting(userId, body.type);
  }

  @Post('prayer-log')
  async logPrayer(
    @GetUser('id') userId: string,
    @Body() body: { prayerName: string; isOnTime: boolean },
  ) {
    return this.religiService.logPrayer(userId, body.prayerName, body.isOnTime);
  }

  @Get('events')
  async getEvents() {
    return this.religiService.getEvents();
  }

  @Get('summary')
  async getSummary(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.religiService.getSummary(userId, familyId);
  }
}
