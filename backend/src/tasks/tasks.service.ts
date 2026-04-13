import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(creatorId: string, familyId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        creatorId,
        familyId,
      },
      include: {
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });
  }

  async findAll(familyId: string) {
    return this.prisma.task.findMany({
      where: { familyId, isDeleted: false },
      include: {
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(taskId: string, familyId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, familyId },
    });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });
  }

  async remove(taskId: string, familyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, familyId },
    });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: taskId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
