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
      },
      include: {
        wallet: true,
      },
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
      include: {
        wallet: true,
        tasks: true,
        transactions: true,
      },
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

    // Create transaction
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

    // Update bill status if fully paid (simple logic for now)
    await this.prisma.bill.update({
      where: { id },
      data: { isPaid: true },
    });

    return transaction;
  }
}
