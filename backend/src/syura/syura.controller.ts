import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { SyuraService } from './syura.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('syura')
@UseGuards(JwtAuthGuard)
export class SyuraController {
  constructor(private syuraService: SyuraService) {}

  @Get('notes')
  async getNotes(@GetUser('familyId') familyId: string) {
    return this.syuraService.getNotes(familyId);
  }

  @Post('notes')
  async createNote(@GetUser('familyId') familyId: string, @Body() body: any) {
    return this.syuraService.createNote(familyId, body);
  }

  @Get('topics')
  async getTopics(@GetUser('familyId') familyId: string) {
    return this.syuraService.getTopics(familyId);
  }

  @Post('topics')
  async createTopic(@GetUser('familyId') familyId: string, @Body() body: { title: string }) {
    return this.syuraService.createTopic(familyId, body.title);
  }

  @Patch('topics/:id')
  async toggleTopic(@GetUser('familyId') familyId: string, @Param('id') id: string) {
    return this.syuraService.toggleTopic(id, familyId);
  }
}
