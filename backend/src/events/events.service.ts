import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EventCategory = 'ANNIVERSARY' | 'BIRTHDAY' | 'MEETING' | 'HOLIDAY' | 'OTHER';

export interface CreateEventDto {
  title: string;
  description?: string;
  category: EventCategory;
  date: string;        // ISO date string "YYYY-MM-DD"
  time?: string;       // "HH:MM"
  recurrence?: 'NONE' | 'YEARLY' | 'MONTHLY' | 'WEEKLY';
  color?: string;
  // 379 – Meeting-specific
  isMeeting?: boolean;
  agendaSlots?: string[];    // e.g. ["Review keuangan", "Rencana liburan"]
  location?: string;
  assigneeIds?: string[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  agendaSlots?: string[];
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // ── 374 Create anniversary / birthday / meeting ───────────────────────────
  async create(familyId: string, creatorId: string, dto: CreateEventDto) {
    const event = await this.prisma.familyEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        date: new Date(dto.date),
        time: dto.time,
        recurrence: (dto.recurrence as any) ?? 'NONE',
        color: dto.color,
        isMeeting: dto.isMeeting ?? false,
        agendaSlots: dto.agendaSlots ? JSON.stringify(dto.agendaSlots) : null,
        location: dto.location,
        familyId,
        creatorId,
      },
    });

    // 377 – Auto-create reminder for the event (1 day before)
    const eventDate = new Date(dto.date);
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(8, 0, 0, 0);

    if (reminderDate > new Date()) {
      await this.prisma.reminder.create({
        data: {
          title: `📅 Besok: ${dto.title}`,
          content: `${dto.category === 'BIRTHDAY' ? '🎂 Ulang Tahun' : dto.category === 'ANNIVERSARY' ? '💍 Hari Jadi' : '🤝 Rapat Keluarga'}: ${dto.title}`,
          remindAt: reminderDate,
          userId: creatorId,
          familyId,
        },
      });
    }

    return { ...event, agendaSlots: dto.agendaSlots ?? [] };
  }

  // ── Find all events for a family, with upcoming anniversary/birthday highlight ─
  async findAll(familyId: string) {
    const events = await this.prisma.familyEvent.findMany({
      where: { familyId, isDeleted: false },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { date: 'asc' },
    });

    // 374 – Compute upcoming occurrences (within next 30 days)
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return events.map((ev) => {
      let nextOccurrence = new Date(ev.date);

      // If recurrence is YEARLY, advance to current year
      if (ev.recurrence === 'YEARLY') {
        nextOccurrence.setFullYear(now.getFullYear());
        if (nextOccurrence < now) nextOccurrence.setFullYear(now.getFullYear() + 1);
      }

      const isUpcoming = nextOccurrence >= now && nextOccurrence <= thirtyDays;
      const daysUntil = Math.ceil((nextOccurrence.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...ev,
        agendaSlots: ev.agendaSlots ? JSON.parse(ev.agendaSlots as string) : [],
        nextOccurrence: nextOccurrence.toISOString(),
        isUpcoming,
        daysUntil: isUpcoming ? daysUntil : null,
      };
    });
  }

  async findOne(id: string, familyId: string) {
    const ev = await this.prisma.familyEvent.findFirst({
      where: { id, familyId, isDeleted: false },
      include: { creator: { select: { id: true, name: true } } },
    });
    if (!ev) throw new NotFoundException('Event not found');
    return { ...ev, agendaSlots: ev.agendaSlots ? JSON.parse(ev.agendaSlots as string) : [] };
  }

  async update(id: string, familyId: string, dto: UpdateEventDto) {
    await this.findOne(id, familyId);
    return this.prisma.familyEvent.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category as any,
        date: dto.date ? new Date(dto.date) : undefined,
        time: dto.time,
        recurrence: dto.recurrence as any,
        color: dto.color,
        isMeeting: dto.isMeeting,
        agendaSlots: dto.agendaSlots ? JSON.stringify(dto.agendaSlots) : undefined,
        location: dto.location,
      },
    });
  }

  async remove(id: string, familyId: string) {
    await this.findOne(id, familyId);
    return this.prisma.familyEvent.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // ── 379 Update meeting agenda slots ──────────────────────────────────────
  async updateAgenda(id: string, familyId: string, agendaSlots: string[]) {
    await this.findOne(id, familyId);
    return this.prisma.familyEvent.update({
      where: { id },
      data: { agendaSlots: JSON.stringify(agendaSlots) },
    });
  }

  // ── 374 Upcoming anniversaries/birthdays (next 60 days) ──────────────────
  async getUpcoming(familyId: string) {
    const events = await this.findAll(familyId);
    return events.filter((e) => e.isUpcoming).sort((a, b) => (a.daysUntil ?? 99) - (b.daysUntil ?? 99));
  }

  // ── Unified calendar feed ─────────────────────────────────────────────────
  async getForMonth(familyId: string, start: Date, end: Date) {
    const events = await this.prisma.familyEvent.findMany({
      where: {
        familyId,
        isDeleted: false,
        OR: [
          { date: { gte: start, lte: end } },
          { recurrence: { not: 'NONE' } }, // recurring ones always included
        ],
      },
      include: { creator: { select: { id: true, name: true } } },
    });

    return events.map((ev) => ({
      ...ev,
      agendaSlots: ev.agendaSlots ? JSON.parse(ev.agendaSlots as string) : [],
      type: ev.category,
      date: ev.date,
    }));
  }
}
