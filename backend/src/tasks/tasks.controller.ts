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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, familyId, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
  ) {
    return this.tasksService.remove(id, familyId);
  }
}
