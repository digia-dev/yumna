import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('reminders')
  async getReminders(@Req() req: any) {
    return this.scheduleService.getReminders(req.user.familyId);
  }

  @Post('reminders')
  async createReminder(@Req() req: any, @Body() body: { title: string; content?: string; remindAt: string }) {
    return this.scheduleService.createReminder(
      req.user.id,
      req.user.familyId,
      {
        ...body,
        remindAt: new Date(body.remindAt),
      }
    );
  }

  @Delete('reminders/:id')
  async deleteReminder(@Req() req: any, @Param('id') id: string) {
    return this.scheduleService.deleteReminder(id, req.user.familyId);
  }
}
