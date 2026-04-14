import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract')
  async extract(@Body('text') text: string) {
    return this.aiService.extractTransaction(text);
  }

  @Post('chat')
  async chat(
    @Body('message') message: string,
    @Body('history') history: any[] = []
  ) {
    const response = await this.aiService.chat(message, history);
    return { response };
  }

  @Get('advisor-insight')
  async getAdvisorInsight(@GetUser('familyId') familyId: string) {
    return this.aiService.generateAdvisorInsight(familyId);
  }
}
