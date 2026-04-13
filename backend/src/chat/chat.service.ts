import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly financeService: FinanceService,
  ) {}

  async getHistory(familyId: string, limit: number = 20, cursor?: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { familyId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, image: true } } },
    });

    // If history is empty, create a welcome message (Task 291)
    if (messages.length === 0 && !cursor) {
      const welcome = await this.prisma.chatMessage.create({
        data: {
          content: "Assalamu'alaikum! Saya Yumna, asisten keuangan keluarga Anda. Saya siap membantu Anda mencatat transaksi (misal: 'Beli kopi 20rb'), membuat tugas, atau memberikan saran barakah. Apa yang bisa saya bantu hari ini?",
          role: 'assistant',
          familyId,
        },
      });
      return [welcome];
    }

    return messages;
  }

  async sendMessage(userId: string, familyId: string, message: string) {
    // 1. Save user message
    const userMsg = await this.prisma.chatMessage.create({
      data: {
        content: message,
        role: 'user',
        userId,
        familyId,
      },
    });

    // 2. Fetch Context (Task 292: Recent Transactions & Tasks)
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { familyId, isDeleted: false },
      take: 5,
      orderBy: { date: 'desc' },
      include: { wallet: { select: { name: true } } }
    });

    let context = recentTransactions.map(t => 
      `${t.date.toISOString().split('T')[0]}: ${t.type} ${t.category} Rp${Number(t.amount)} (${t.description || 'Tanpa keterangan'}) [Wallet: ${t.wallet.name}]`
    ).join('\n');

    // 2.1 Add Weekly Report context if analytical intent is high (Task 293)
    if (message.toLowerCase().includes('laporan') || message.toLowerCase().includes('analisis') || message.toLowerCase().includes('minggu')) {
       const weeklyData = await this.financeService.getWeeklyAdvisorData(familyId);
       context += `\n\nLAPORAN MINGGUAN:\nIncome: ${weeklyData.income}\nExpense: ${weeklyData.expense}\nTop Categories: ${weeklyData.topCategories.map(c => `${c.name}: ${c.amount}`).join(', ')}`;
    }

    // 3. Get AI response with content awareness
    const recentHistory = await this.prisma.chatMessage.findMany({
      where: { familyId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const aiResponse = await this.aiService.chat(message, recentHistory.reverse().map(m => ({
      role: m.role,
      content: m.content
    })), context);

    // 4. Save AI message
    const assistantMsg = await this.prisma.chatMessage.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        familyId,
      },
    });

    return assistantMsg;
  }

  // Task 284: Category Mapping Logic
  mapCategory(extractedCategory: string): string {
    const standardCategories = [
      'Pangan', 'Transportasi', 'Utilitas', 'Cicilan', 
      'Sedekah', 'Pendidikan', 'Hiburan', 'Kesehatan', 'Wakaf', 'Lainnya'
    ];

    // Simple fuzzy match or fallback
    const matched = standardCategories.find(
      cat => cat.toLowerCase() === extractedCategory.toLowerCase()
    );

    return matched || 'Lainnya';
  }
}
