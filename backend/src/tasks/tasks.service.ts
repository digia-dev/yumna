import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { GamificationService } from '../gamification/gamification.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private aiService: AiService,
  ) {}

  async create(creatorId: string, familyId: string, dto: CreateTaskDto) {
    const { dependencyIds, ...taskData } = dto;
    return this.prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category || 'Lainnya',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        assigneeId: taskData.assigneeId || null,
        creatorId,
        familyId,
        parentId: taskData.parentId || null,
        billId: taskData.billId || null,
        dependencies: dependencyIds ? {
          connect: dependencyIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true } },
        parent: { select: { id: true, title: true } },
        bill: true,
        dependencies: true,
      },
    });
  }

  async findAll(familyId: string) {
    return this.prisma.task.findMany({
      where: { familyId, isDeleted: false, parentId: null, NOT: { status: 'COMPLETED' } },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true } },
        subTasks: {
          where: { isDeleted: false },
          include: { assignee: { select: { id: true, name: true } } }
        },
        bill: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getHistory(familyId: string) {
    return this.prisma.task.findMany({
      where: {
        familyId,
        OR: [
          { isDeleted: true },
          { status: 'COMPLETED' },
          { status: 'CANCELLED' }
        ]
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true } },
        bill: { select: { id: true, title: true, amount: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getShoppingList(familyId: string) {
    return this.prisma.task.findMany({
      where: {
        familyId,
        isDeleted: false,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        category: { equals: 'Belanja', mode: 'insensitive' }
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        checklists: true,
        bill: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSuggestions(familyId: string) {
    return this.aiService.suggestTasks(familyId);
  }

  async update(taskId: string, userId: string, familyId: string, dto: UpdateTaskDto) {
    const { dependencyIds, ...updateData } = dto;
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, familyId },
    });

    if (!task) throw new NotFoundException('Task not found');

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        lastEditedById: userId,
        lastEditedAt: new Date(),
        dependencies: dependencyIds ? {
          set: dependencyIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        bill: true,
        dependencies: true,
      }
    });

    if (dto.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      await this.gamificationService.addPoints(familyId, 50, `Menyelesaikan amanah: ${task.title}`);
    }

    return updatedTask;
  }

  async addAttachment(taskId: string, familyId: string, url: string, name: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, familyId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.taskAttachment.create({
      data: {
        taskId,
        url,
        name,
      }
    });
  }

  async removeAttachment(attachmentId: string) {
    return this.prisma.taskAttachment.delete({
      where: { id: attachmentId }
    });
  }

  async applyTemplate(familyId: string, creatorId: string, templateType: 'RAMADAN' | 'HOUSEHOLD_DAILY' | 'FINANCE_WEEKLY') {
    const templates = {
      RAMADAN: [
        { title: 'Persiapan Sahur', category: 'Ibadah', description: 'Menyiapkan menu sahur bergizi' },
        { title: 'Khatam Quran Target 1 Juz', category: 'Ibadah', description: 'Tadarus bersama setelah Subuh' },
        { title: 'Sedekah Iftar', category: 'Sosial', description: 'Menyiapkan 10 paket takjil untuk masjid' }
      ],
      HOUSEHOLD_DAILY: [
        { title: 'Pembersihan Ruang Tamu', category: 'Rumah', description: 'Menyapu dan merapikan mainan' },
        { title: 'Siram Tanaman', category: 'Rumah', description: 'Pagi dan Sore' }
      ],
      FINANCE_WEEKLY: [
        { title: 'Evaluasi Pengeluaran Pekanan', category: 'Finance', description: 'Input sisa nota ke Yumna' },
        { title: 'Alokasi Dana Darurat', category: 'Finance', description: 'Pindahkan 10% sisa budget' }
      ]
    };

    const tasksToCreate = templates[templateType] || [];
    
    return Promise.all(tasksToCreate.map(t => this.create(creatorId, familyId, {
      ...t,
      priority: 'MEDIUM'
    })));
  }

  async exportCalendar(familyId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { familyId, isDeleted: false, dueDate: { not: null } },
      orderBy: { dueDate: 'asc' }
    });

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Yumna//Task Calendar//ID\n";
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dt = new Date(task.dueDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `UID:${task.id}@yumna.app\n`;
        icsContent += `DTSTAMP:${dt}\n`;
        icsContent += `DTSTART:${dt}\n`;
        icsContent += `SUMMARY:Yumna: ${task.title}\n`;
        icsContent += `DESCRIPTION:${task.description || ''}\n`;
        icsContent += "END:VEVENT\n";
      }
    });

    icsContent += "END:VCALENDAR";
    return icsContent;
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

  async findOne(taskId: string, familyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, familyId, isDeleted: false },
      include: {
        assignee: { select: { id: true, name: true, image: true, role: true } },
        creator: { select: { id: true, name: true } },
        checklists: { orderBy: { createdAt: 'asc' } },
        attachments: { orderBy: { createdAt: 'desc' } },
        comments: {
          include: { user: { select: { id: true, name: true, image: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async addComment(taskId: string, userId: string, content: string) {
    return this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
      },
    });
  }

  async addChecklistItem(taskId: string, title: string) {
    return this.prisma.taskChecklistItem.create({
      data: {
        taskId,
        title,
      },
    });
  }

  async toggleChecklistItem(itemId: string, isDone: boolean) {
    return this.prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: { isDone },
    });
  }

  async removeChecklistItem(itemId: string) {
    return this.prisma.taskChecklistItem.delete({
      where: { id: itemId },
    });
  }
}
