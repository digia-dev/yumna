import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('barakah-score')
  async getBarakahScore(@Req() req: any) {
    return this.gamificationService.getBarakahData(req.user.familyId);
  }
}
