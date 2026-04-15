import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(familyId: string, dto: CreateBillDto) {
    return this.prisma.bill.create({
      data: {
        name: dto.title,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        recurrence: (dto.recurrence as any) || 'NONE',
        category: dto.category || 'Lainnya',
        familyId,
        walletId: dto.walletId,
        autoPay: dto.autoPay ?? false,
      },
      include: { wallet: true },
    });
  }

  async findAll(familyId: string) {
    return this.prisma.bill.findMany({
      where: { familyId, isDeleted: false },
      include: {
        wallet: { select: { id: true, name: true } },
        tasks: { select: { id: true, title: true, status: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, familyId: string) {
    const bill = await this.prisma.bill.findFirst({
      where: { id, familyId, isDeleted: false },
      include: { wallet: true, tasks: true, transactions: true },
    });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async update(id: string, familyId: string, dto: UpdateBillDto) {
    await this.findOne(id, familyId);
    return this.prisma.bill.update({
      where: { id },
      data: {
        name: dto.title,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        recurrence: dto.recurrence as any,
        category: dto.category,
        walletId: dto.walletId,
        isPaid: dto.isPaid,
        autoPay: dto.autoPay,
      },
    });
  }

  async remove(id: string, familyId: string) {
    await this.findOne(id, familyId);
    return this.prisma.bill.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async payBill(id: string, familyId: string, userId: string, amount: number) {
    const bill = await this.findOne(id, familyId);

    if (!bill.walletId) {
      throw new BadRequestException(
        'Tagihan ini tidak memiliki dompet sumber pembayaran.',
      );
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        amount,
        type: 'EXPENSE',
        category: bill.category,
        description: `Pembayaran tagihan: ${bill.name}`,
        status: 'HALAL',
        familyId,
        userId,
        walletId: bill.walletId,
        billId: bill.id,
      },
    });

    await this.prisma.bill.update({
      where: { id },
      data: { isPaid: true },
    });

    // Mark all linked tasks as completed
    await this.prisma.task.updateMany({
      where: { billId: id, status: { not: 'COMPLETED' } },
      data: { status: 'COMPLETED' },
    });

    return transaction;
  }

  // ── 376 Create a task linked to this bill ─────────────────────────────────
  async createBillTask(billId: string, familyId: string, creatorId: string, assigneeId?: string) {
    const bill = await this.findOne(billId, familyId);

    // Check if a task already linked
    const existing = await this.prisma.task.findFirst({
      where: { billId, isDeleted: false, status: { not: 'COMPLETED' } },
    });
    if (existing) return existing;

    const daysUntilDue = bill.dueDate
      ? Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / 86400000)
      : 7;

    const task = await this.prisma.task.create({
      data: {
        title: `💳 Bayar: ${bill.name}`,
        description: `Tagihan sebesar Rp ${Number(bill.amount).toLocaleString('id-ID')} jatuh tempo ${
          bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('id-ID') : 'segera'
        }. ${bill.walletId ? `Bayar dari dompet terhubung.` : ''}`,
        priority: daysUntilDue <= 3 ? 'URGENT' : daysUntilDue <= 7 ? 'HIGH' : 'MEDIUM',
        category: 'Finance',
        familyId,
        creatorId,
        billId,
        assigneeId: assigneeId ?? null,
        dueDate: bill.dueDate ?? null,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        bill: true,
      },
    });

    return task;
  }

  // ── 377 Get upcoming bills for auto-pay reminder generation ───────────────
  async getUpcomingBills(familyId: string, daysAhead = 7) {
    const threshold = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return this.prisma.bill.findMany({
      where: {
        familyId,
        isDeleted: false,
        isPaid: false,
        dueDate: { lte: threshold },
      },
      include: {
        wallet: { select: { id: true, name: true, balance: true } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // ── 377 Toggle auto-pay setting ───────────────────────────────────────────
  async toggleAutoPay(id: string, familyId: string) {
    const bill = await this.findOne(id, familyId);
    return this.prisma.bill.update({
      where: { id },
      data: { autoPay: !bill.autoPay },
    });
  }

  // ── 377 Generate reminders for upcoming bills ─────────────────────────────
  async generateAutoPayReminders(familyId: string, userId: string) {
    const upcoming = await this.getUpcomingBills(familyId, 7);
    const created: any[] = [];

    for (const bill of upcoming) {
      if (!bill.dueDate) continue;

      // Check if reminder already exists
      const existingReminder = await this.prisma.reminder.findFirst({
        where: {
          familyId,
          title: { contains: bill.name },
          isSent: false,
        },
      });
      if (existingReminder) continue;

      const remindAt = new Date(bill.dueDate);
      remindAt.setDate(remindAt.getDate() - 2); // 2 days before
      remindAt.setHours(8, 0, 0, 0);

      if (remindAt < new Date()) continue;

      const balanceSufficient = bill.wallet
        ? (bill.wallet as any).balance >= bill.amount
        : null;

      const reminder = await this.prisma.reminder.create({
        data: {
          title: `💳 Tagihan Jatuh Tempo: ${bill.name}`,
          content: `Tagihan **${bill.name}** sebesar **Rp ${Number(bill.amount).toLocaleString('id-ID')}** jatuh tempo ${
            new Date(bill.dueDate).toLocaleDateString('id-ID')
          }. ${
            balanceSufficient === false
              ? '⚠️ Saldo dompet tidak mencukupi!'
              : balanceSufficient === true
              ? '✅ Saldo mencukupi untuk pembayaran.'
              : ''
          }${bill.autoPay ? '\n🤖 Auto-bayar diaktifkan.' : ''}`,
          remindAt,
          userId,
          familyId,
        },
      });
      created.push(reminder);
    }

    return { created: created.length, reminders: created };
  }
}
