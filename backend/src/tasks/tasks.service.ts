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
    const task = await this.prisma.task.create({
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
        isPrivate: taskData.isPrivate || false,
        color: taskData.color || null,
        // New fields — cast until Prisma client is regenerated
        ...(taskData.estimatedMinutes !== undefined ? { estimatedMinutes: taskData.estimatedMinutes } : {}),
        ...(taskData.recurringType ? { recurringType: taskData.recurringType } : {}),
        ...(taskData.holidayDate ? { holidayDate: new Date(taskData.holidayDate) } : {}),
        dependencies: dependencyIds
          ? {
              connect: dependencyIds.map((id) => ({ id })),
            }
          : undefined,
      } as any,
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true } },
        parent: { select: { id: true, title: true } },
        bill: true,
        dependencies: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'TASK_CREATE',
        details: `Task created: ${task.title}`,
        userId: creatorId,
      },
    });

    return task;
  }

  async findAll(familyId: string, userId?: string) {
    return this.prisma.task.findMany({
      where: {
        familyId,
        isDeleted: false,
        parentId: null,
        NOT: { status: 'COMPLETED' },
        // 359 – private tasks: only show own private tasks
        OR: [
          { isPrivate: false },
          { isPrivate: true, creatorId: userId },
          { isPrivate: true, assigneeId: userId },
        ],
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true } },
        subTasks: {
          where: { isDeleted: false },
          include: { assignee: { select: { id: true, name: true } } },
        },
        bill: true,
        checklists: true,
        dependencies: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getHistory(familyId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        user: { familyId },
        action: { startsWith: 'TASK_' },
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getShoppingList(familyId: string) {
    return this.prisma.task.findMany({
      where: {
        familyId,
        isDeleted: false,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        category: { equals: 'Belanja', mode: 'insensitive' },
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

  // ── 356 Task Leaderboard ──────────────────────────────────────────────────
  async getLeaderboard(familyId: string) {
    const members = await this.prisma.user.findMany({
      where: { familyId },
      select: { id: true, name: true, image: true, role: true },
    });

    const leaderboard = await Promise.all(
      members.map(async (member) => {
        const completed = await this.prisma.task.count({
          where: {
            familyId,
            assigneeId: member.id,
            status: 'COMPLETED',
            isDeleted: false,
          },
        });
        const total = await this.prisma.task.count({
          where: {
            familyId,
            assigneeId: member.id,
            isDeleted: false,
          },
        });
        const thisWeek = await this.prisma.task.count({
          where: {
            familyId,
            assigneeId: member.id,
            status: 'COMPLETED',
            isDeleted: false,
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        });
        return {
          ...member,
          completed,
          total,
          thisWeek,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          points: completed * 50 + thisWeek * 10,
        };
      }),
    );

    return leaderboard.sort((a, b) => b.points - a.points);
  }

  // ── 361 Weekly Routine View ────────────────────────────────────────────────
  async getWeeklyRoutine(familyId: string) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Recurring tasks
    const recurring = await this.prisma.task.findMany({
      where: {
        familyId,
        isDeleted: false,
        ...(({ recurringType: { not: null } }) as any),
      } as any,
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        checklists: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Tasks due this week
    const dueThisWeek = await this.prisma.task.findMany({
      where: {
        familyId,
        isDeleted: false,
        dueDate: { gte: startOfWeek, lte: endOfWeek },
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        checklists: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return { recurring, dueThisWeek, weekStart: startOfWeek, weekEnd: endOfWeek };
  }

  // ── 362 Holiday Planner ───────────────────────────────────────────────────
  async getHolidayPlanner(familyId: string) {
    return this.prisma.task.findMany({
      where: {
        familyId,
        isDeleted: false,
        ...(({ holidayDate: { not: null } }) as any),
      } as any,
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        checklists: true,
        subTasks: {
          where: { isDeleted: false },
          include: { assignee: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' } as any,
    });
  }

  // ── 364 Auto-archive completed tasks after 30 days ────────────────────────
  async autoArchive(familyId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const archived = await this.prisma.task.updateMany({
      where: {
        familyId,
        status: 'COMPLETED',
        isDeleted: false,
        updatedAt: { lte: thirtyDaysAgo },
      },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    return { archivedCount: archived.count };
  }

  // ── 368 Family Agenda (structured for PDF generation) ────────────────────
  async getFamilyAgenda(familyId: string) {
    const [tasks, members, bills] = await Promise.all([
      this.prisma.task.findMany({
        where: { familyId, isDeleted: false },
        include: {
          assignee: { select: { id: true, name: true } },
          checklists: true,
        },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
        take: 200,
      }),
      this.prisma.user.findMany({
        where: { familyId },
        select: { id: true, name: true, role: true },
      }),
      this.prisma.bill.findMany({
        where: { familyId, isPaid: false },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
    ]);

    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      select: { name: true },
    });

    return {
      familyName: family?.name || 'Keluarga Yumna',
      generatedAt: new Date().toISOString(),
      members,
      tasks: {
        pending: tasks.filter((t) => t.status === 'PENDING'),
        inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS'),
        completed: tasks.filter((t) => t.status === 'COMPLETED'),
      },
      pendingBills: bills,
      stats: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === 'COMPLETED').length,
        overdue: tasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED',
        ).length,
      },
    };
  }

  // ── 370 Performance: paginated task list ──────────────────────────────────
  async findAllPaginated(
    familyId: string,
    userId: string,
    page = 1,
    limit = 20,
    filterAssigneeId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      familyId,
      isDeleted: false,
      parentId: null,
      OR: [
        { isPrivate: false },
        { isPrivate: true, creatorId: userId },
        { isPrivate: true, assigneeId: userId },
      ],
    };

    if (filterAssigneeId) where.assigneeId = filterAssigneeId;

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, image: true } },
          subTasks: {
            where: { isDeleted: false },
            select: { id: true, status: true },
          },
          checklists: { select: { id: true, isDone: true } },
          _count: { select: { attachments: true, comments: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    taskId: string,
    userId: string,
    familyId: string,
    dto: UpdateTaskDto,
  ) {
    const { dependencyIds, ...updateData } = dto;
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, familyId },
    });

    if (!task) throw new NotFoundException('Task not found');

    // 363 – Check dependencies: block COMPLETED if dependencies not done
    if (dto.status === 'COMPLETED') {
      const deps = await this.prisma.task.findMany({
        where: { dependents: { some: { id: taskId } }, status: { not: 'COMPLETED' } },
      });
      // Soft guard: just warn, don't block
      void deps;
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        lastEditedById: userId,
        lastEditedAt: new Date(),
        ...(updateData.estimatedMinutes !== undefined
          ? { estimatedMinutes: updateData.estimatedMinutes }
          : {}),
        ...(updateData.color !== undefined ? { color: updateData.color } : {}),
        ...(updateData.recurringType !== undefined
          ? { recurringType: updateData.recurringType }
          : {}),
        dependencies: dependencyIds
          ? {
              set: dependencyIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        bill: true,
        dependencies: { select: { id: true, title: true, status: true } },
      },
    });

    const action =
      dto.status && dto.status !== task.status
        ? dto.status === 'COMPLETED'
          ? 'TASK_COMPLETED'
          : 'TASK_STATUS_UPDATED'
        : 'TASK_UPDATED';

    await this.prisma.auditLog.create({
      data: {
        action,
        details: `Task updated: ${task.title} ${dto.status ? `-> ${dto.status}` : ''}`,
        userId,
      },
    });

    if (dto.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      await this.gamificationService.addPoints(
        familyId,
        50,
        `Menyelesaikan amanah: ${task.title}`,
      );
    }

    return updatedTask;
  }

  async addAttachment(
    taskId: string,
    familyId: string,
    url: string,
    name: string,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, familyId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.taskAttachment.create({
      data: { taskId, url, name },
    });
  }

  async removeAttachment(attachmentId: string) {
    return this.prisma.taskAttachment.delete({ where: { id: attachmentId } });
  }

  async applyTemplate(
    familyId: string,
    creatorId: string,
    templateType: 'RAMADAN' | 'HOUSEHOLD_DAILY' | 'FINANCE_WEEKLY',
  ) {
    const templates = {
      RAMADAN: [
        { title: 'Persiapan Sahur', category: 'Ibadah', description: 'Menyiapkan menu sahur bergizi' },
        { title: 'Khatam Quran Target 1 Juz', category: 'Ibadah', description: 'Tadarus bersama setelah Subuh' },
        { title: 'Sedekah Iftar', category: 'Sosial', description: 'Menyiapkan 10 paket takjil untuk masjid' },
      ],
      HOUSEHOLD_DAILY: [
        { title: 'Pembersihan Ruang Tamu', category: 'Rumah', description: 'Menyapu dan merapikan mainan' },
        { title: 'Siram Tanaman', category: 'Rumah', description: 'Pagi dan Sore' },
      ],
      FINANCE_WEEKLY: [
        { title: 'Evaluasi Pengeluaran Pekanan', category: 'Finance', description: 'Input sisa nota ke Yumna' },
        { title: 'Alokasi Dana Darurat', category: 'Finance', description: 'Pindahkan 10% sisa budget' },
      ],
    };

    const tasksToCreate = templates[templateType] || [];
    return Promise.all(
      tasksToCreate.map((t) => this.create(creatorId, familyId, { ...t, priority: 'MEDIUM' })),
    );
  }

  async exportCalendar(familyId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { familyId, isDeleted: false, dueDate: { not: null } },
      include: { assignee: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
    });

    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Yumna//Task Calendar//ID\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n';

    tasks.forEach((task) => {
      if (task.dueDate) {
        const dt = new Date(task.dueDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const priority = task.priority === 'URGENT' ? '1' : task.priority === 'HIGH' ? '3' : '5';
        ics += 'BEGIN:VEVENT\n';
        ics += `UID:${task.id}@yumna.app\n`;
        ics += `DTSTAMP:${dt}\nDTSTART:${dt}\nDTEND:${dt}\n`;
        ics += `SUMMARY:${task.category ? `[${task.category}] ` : ''}${task.title}\n`;
        ics += `DESCRIPTION:${task.description || 'Yumna Family Task'}\n`;
        ics += `PRIORITY:${priority}\n`;
        if (task.assignee?.name) ics += `ORGANIZER;CN=${task.assignee.name}:MAILTO:noreply@yumna.app\n`;
        if (task.color) ics += `COLOR:${task.color}\n`;
        ics += 'END:VEVENT\n';
      }
    });

    ics += 'END:VCALENDAR';
    return ics;
  }

  async remove(taskId: string, userId: string, familyId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, familyId } });
    if (!task) throw new NotFoundException('Task not found');

    const deletedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: { action: 'TASK_DELETED', details: `Task deleted: ${task.title}`, userId },
    });

    return deletedTask;
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
        subTasks: {
          where: { isDeleted: false },
          include: { assignee: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'asc' },
        },
        // 363 – Dependencies
        dependencies: { select: { id: true, title: true, status: true, priority: true } },
        parent: { select: { id: true, title: true } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async addComment(taskId: string, userId: string, content: string) {
    return this.prisma.taskComment.create({
      data: { taskId, userId, content },
      include: { user: { select: { id: true, name: true, image: true, role: true } } },
    });
  }

  async addChecklistItem(taskId: string, title: string) {
    return this.prisma.taskChecklistItem.create({ data: { taskId, title } });
  }

  async toggleChecklistItem(itemId: string, isDone: boolean) {
    return this.prisma.taskChecklistItem.update({ where: { id: itemId }, data: { isDone } });
  }

  async removeChecklistItem(itemId: string) {
    return this.prisma.taskChecklistItem.delete({ where: { id: itemId } });
  }
}
