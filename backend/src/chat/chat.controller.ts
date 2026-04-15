import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
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
    @Body('attachmentUrl') attachmentUrl?: string,
  ) {
    const userId = req.user.id;
    const familyId = req.user.familyId;
    return this.chatService.sendMessage(
      userId,
      familyId,
      message,
      attachmentUrl,
    );
  }

  @Get('pinned')
  async getPinnedMessages(@Req() req: any) {
    const familyId = req.user.familyId;
    return this.chatService.getPinnedMessages(familyId);
  }

  @Patch('reaction')
  async toggleReaction(
    @Req() req: any,
    @Body('messageId') messageId: string,
    @Body('emoji') emoji: string,
  ) {
    const userId = req.user.id;
    return this.chatService.toggleReaction(messageId, userId, emoji);
  }

  @Patch('pin/:id')
  async togglePin(@Param('id') id: string) {
    return this.chatService.togglePin(id);
  }

  @Get('export')
  async exportHistory(@Req() req: any) {
    const familyId = req.user.familyId;
    return this.chatService.exportHistory(familyId);
  }

  @Post('delete')
  async deleteMessage(@Req() req: any, @Body('messageId') messageId: string) {
    const userId = req.user.id;
    const familyId = req.user.familyId;
    return this.chatService.deleteMessage(messageId, userId, familyId);
  }

  @Post('translate')
  async translateMessage(
    @Body('messageId') messageId: string,
    @Body('targetLang') targetLang?: string,
  ) {
    return this.chatService.translateMessage(messageId, targetLang);
  }
}
