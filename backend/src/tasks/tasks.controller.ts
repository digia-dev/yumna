import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  async create(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId, familyId, dto);
  }

  // ── 358 Filter by Assignee + 370 Paginated ──────────────────────────────
  @Get()
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (page) {
      return this.tasksService.findAllPaginated(
        familyId,
        userId,
        parseInt(page) || 1,
        parseInt(limit ?? '20') || 20,
        assigneeId,
      );
    }
    return this.tasksService.findAll(familyId, userId);
  }

  @Get('history')
  async getHistory(@GetUser('familyId') familyId: string) {
    return this.tasksService.getHistory(familyId);
  }

  @Get('shopping')
  async getShoppingList(@GetUser('familyId') familyId: string) {
    return this.tasksService.getShoppingList(familyId);
  }

  @Get('suggestions')
  async getSuggestions(@GetUser('familyId') familyId: string) {
    return this.tasksService.getSuggestions(familyId);
  }

  // ── 356 Task Leaderboard ─────────────────────────────────────────────────
  @Get('leaderboard')
  async getLeaderboard(@GetUser('familyId') familyId: string) {
    return this.tasksService.getLeaderboard(familyId);
  }

  // ── 361 Weekly Routine ──────────────────────────────────────────────────
  @Get('weekly-routine')
  async getWeeklyRoutine(@GetUser('familyId') familyId: string) {
    return this.tasksService.getWeeklyRoutine(familyId);
  }

  // ── 362 Holiday Planner ─────────────────────────────────────────────────
  @Get('holiday-planner')
  async getHolidayPlanner(@GetUser('familyId') familyId: string) {
    return this.tasksService.getHolidayPlanner(familyId);
  }

  // ── 364 Auto-archive ────────────────────────────────────────────────────
  @Post('auto-archive')
  @HttpCode(200)
  async autoArchive(@GetUser('familyId') familyId: string) {
    return this.tasksService.autoArchive(familyId);
  }

  // ── 368 Family Agenda (JSON for PDF client-side render) ─────────────────
  @Get('agenda')
  async getFamilyAgenda(@GetUser('familyId') familyId: string) {
    return this.tasksService.getFamilyAgenda(familyId);
  }

  @Post('templates/apply')
  async applyTemplate(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body('templateType')
    templateType: 'RAMADAN' | 'HOUSEHOLD_DAILY' | 'FINANCE_WEEKLY',
  ) {
    return this.tasksService.applyTemplate(familyId, userId, templateType);
  }

  @Get('calendar/export')
  async exportCalendar(@GetUser('familyId') familyId: string) {
    return this.tasksService.exportCalendar(familyId);
  }

  @Post(':id/attachments')
  async addAttachment(
    @Param('id') taskId: string,
    @GetUser('familyId') familyId: string,
    @Body('url') url: string,
    @Body('name') name: string,
  ) {
    return this.tasksService.addAttachment(taskId, familyId, url, name);
  }

  @Delete('attachments/:id')
  async removeAttachment(@Param('id') attachmentId: string) {
    return this.tasksService.removeAttachment(attachmentId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.tasksService.findOne(id, familyId);
  }

  // ── 357 Sub-tasks: create child task under parent ───────────────────────
  @Post(':id/subtasks')
  async createSubTask(
    @Param('id') parentId: string,
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId, familyId, { ...dto, parentId });
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.tasksService.addComment(id, userId, content);
  }

  @Post(':id/checklists')
  async addChecklistItem(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.tasksService.addChecklistItem(id, title);
  }

  @Patch('checklists/:itemId')
  async toggleChecklistItem(
    @Param('itemId') itemId: string,
    @Body('isDone') isDone: boolean,
  ) {
    return this.tasksService.toggleChecklistItem(itemId, isDone);
  }

  @Delete('checklists/:itemId')
  async removeChecklistItem(@Param('itemId') itemId: string) {
    return this.tasksService.removeChecklistItem(itemId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, userId, familyId, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.tasksService.remove(id, userId, familyId);
  }
}
