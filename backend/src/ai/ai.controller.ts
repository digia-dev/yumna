import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
