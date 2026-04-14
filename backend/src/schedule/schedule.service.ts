import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminders() {
    const now = new Date();
    // Use a small buffer to avoid missing reminders exactly at the edge
    const reminders = await this.prisma.reminder.findMany({
      where: {
        remindAt: { lte: now },
        isSent: false,
      },
      include: {
        user: true,
        family: true,
      },
    });

    if (reminders.length > 0) {
      this.logger.log(`Found ${reminders.length} pending reminders to process.`);
    }

    for (const reminder of reminders) {
      try {
        this.logger.log(`Sending reminder: [${reminder.title}] to family [${reminder.familyId}] for user [${reminder.userId}]`);
        
        // Push message to chat as AI system message (Task 309)
        const content = `🕒 **PENGINGAT YUMNA**\n\nAssalamu'alaikum, @${reminder.user?.name || 'User'}.\nYumna ingin mengingatkan:\n\n**${reminder.title}**\n${reminder.content || ''}\n\n*Semoga barakah.*`;
        
        await this.chatService.sendAiMessage(reminder.familyId, content);

        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { isSent: true },
        });
      } catch (error) {
        this.logger.error(`Failed to send reminder ${reminder.id}: ${error.message}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurringTasks() {
    this.logger.log('Running recurring tasks generation...');
    
    // Find all "Template" tasks or parental recurring tasks
    const recurringTemplates = await this.prisma.task.findMany({
      where: {
        recurrence: { not: 'NONE' },
        parentId: null, // Only top-level templates
        isDeleted: false,
      }
    });

    for (const template of recurringTemplates) {
      try {
        // Calculate next due date
        let nextDueDate = new Date(template.dueDate || new Date());
        const now = new Date();

        // If the template's first due date is already in the past, move it forward
        while (nextDueDate < now) {
          if (template.recurrence === 'DAILY') nextDueDate.setDate(nextDueDate.getDate() + 1);
          else if (template.recurrence === 'WEEKLY') nextDueDate.setDate(nextDueDate.getDate() + 7);
          else if (template.recurrence === 'MONTHLY') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          else break;
        }

        // Check if the next instance already exists
        const existingNext = await this.prisma.task.findFirst({
          where: {
            parentId: template.id,
            dueDate: nextDueDate,
            isDeleted: false,
          }
        });

        if (!existingNext) {
          await this.prisma.task.create({
            data: {
              title: template.title,
              description: template.description,
              priority: template.priority,
              category: template.category,
              familyId: template.familyId,
              creatorId: template.creatorId,
              assigneeId: template.assigneeId,
              recurrence: template.recurrence,
              parentId: template.id,
              dueDate: nextDueDate,
            }
          });
          this.logger.log(`Generated next instance for task: ${template.title} on ${nextDueDate.toDateString()}`);
        }
      } catch (err) {
        this.logger.error(`Failed to generate recurring task for ${template.id}: ${err.message}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleTaskDueReminders() {
    const now = new Date();
    const boundary = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const upcomingTasks = await this.prisma.task.findMany({
      where: {
        dueDate: { lte: boundary, gte: now },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        isDeleted: false,
        dueReminderSent: false,
      },
      include: {
        assignee: true,
      },
    });

    for (const task of upcomingTasks) {
      try {
        const message = `⚠️ **PENGINGAT AMANAH**\n\nAssalamu'alaikum, ${task.assignee ? `@${task.assignee.name}` : 'Keluarga'}.\nAda tugas yang mendekati batas waktu:\n\n**${task.title}**\nBatas: ${task.dueDate?.toLocaleString('id-ID') || 'N/A'}\n\n*Semangat mengerjakannya!*`;
        
        await this.chatService.sendAiMessage(task.familyId, message);

        await this.prisma.task.update({
          where: { id: task.id },
          data: { dueReminderSent: true },
        });
      } catch (err) {
        this.logger.error(`Failed to send due reminder for task ${task.id}: ${err.message}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleOverdueAlerts() {
    this.logger.log('Checking for overdue tasks...');
    const now = new Date();

    const overdueTasks = await this.prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        isDeleted: false,
      },
      include: {
        assignee: true,
      },
    });

    for (const task of overdueTasks) {
      try {
        const message = `🚨 **AMANAH TERLEWAT (OVERDUE)**\n\nAssalamu'alaikum, ${task.assignee ? `@${task.assignee.name}` : 'Keluarga'}.\nTugas ini sudah melewati batas waktu:\n\n**${task.title}**\nBatas: ${task.dueDate?.toLocaleString('id-ID') || 'N/A'}\n\n*Yuk, segera diselesaikan demi keberkahan.*`;
        
        await this.chatService.sendAiMessage(task.familyId, message);
      } catch (err) {
        this.logger.error(`Failed to send overdue alert for ${task.id}: ${err.message}`);
      }
    }
  }

  async createReminder(userId: string, familyId: string, data: { title: string; content?: string; remindAt: Date }) {
    return this.prisma.reminder.create({
      data: {
        ...data,
        userId,
        familyId,
      },
    });
  }

  async getReminders(familyId: string) {
    return this.prisma.reminder.findMany({
      where: { familyId },
      orderBy: { remindAt: 'asc' },
    });
  }

  async deleteReminder(id: string, familyId: string) {
    return this.prisma.reminder.delete({
      where: { id, familyId },
    });
  }

  async getUnifiedSchedule(familyId: string, start: Date, end: Date) {
    const reminders = await this.prisma.reminder.findMany({
      where: {
        familyId,
        remindAt: { gte: start, lte: end },
      },
      include: { user: { select: { name: true } } },
    });

    const tasks = await this.prisma.task.findMany({
      where: {
        familyId,
        dueDate: { gte: start, lte: end },
        isDeleted: false,
      },
      include: { assignee: { select: { name: true } } },
    });

    return {
      reminders: reminders.map(r => ({ ...r, type: 'REMINDER', date: r.remindAt })),
      tasks: tasks.map(t => ({ ...t, type: 'TASK', date: t.dueDate })),
    };
  }
}
