import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getHistory(
    @Req() req: any,
    @Query('limit') limit: number = 20,
    @Query('cursor') cursor?: string,
  ) {
    const familyId = req.user.familyId;
    return this.chatService.getHistory(familyId, Number(limit), cursor);
  }

  @Post('send')
  async sendMessage(
    @Req() req: any,
    @Body('message') message: string,
  ) {
    const userId = req.user.id;
    const familyId = req.user.familyId;
    return this.chatService.sendMessage(userId, familyId, message);
  }
}
