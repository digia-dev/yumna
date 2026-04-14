import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  @Get()
  async findAll(@GetUser('familyId') familyId: string) {
    return this.tasksService.findAll(familyId);
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, userId, familyId, dto);
  }

  @Post('templates/apply')
  async applyTemplate(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body('templateType') templateType: 'RAMADAN' | 'HOUSEHOLD_DAILY' | 'FINANCE_WEEKLY'
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
    @Body('name') name: string
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

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.tasksService.remove(id, familyId);
  }
}
