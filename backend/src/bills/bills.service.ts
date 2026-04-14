import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(familyId: string, dto: CreateBillDto) {
    return this.prisma.bill.create({
      data: {
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        recurrence: dto.recurrence || 'NONE',
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
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string, familyId: string) {
    await this.findOne(id, familyId);
    return this.prisma.bill.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async payBill(id: string, familyId: string, userId: string, amount: number) {
    const bill = await this.findOne(id, familyId);
    
    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        amount,
        type: 'EXPENSE',
        category: bill.category,
        description: `Pembayaran tagihan: ${bill.title}`,
        status: 'COMPLETED',
        familyId,
        userId,
        walletId: bill.walletId,
        billId: bill.id,
      }
    });

    // Update bill status if fully paid (simple logic for now)
    await this.prisma.bill.update({
      where: { id },
      data: { status: 'PAID' }
    });

    return transaction;
  }
}
