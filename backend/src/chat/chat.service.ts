import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { FinanceService } from '../finance/finance.service';
import { encrypt, decrypt } from '../common/utils/crypto.util';

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

    // Decrypt messages for display
    const decryptedMessages = messages.map(msg => ({
      ...msg,
      content: decrypt(msg.content),
    }));

    // If history is empty, create a welcome message (Task 291)
    if (decryptedMessages.length === 0 && !cursor) {
      const welcomeContent = "Assalamu'alaikum! Saya Yumna, asisten keuangan keluarga Anda. Saya siap membantu Anda mencatat transaksi (misal: 'Beli kopi 20rb'), membuat tugas, atau memberikan saran barakah. Apa yang bisa saya bantu hari ini?";
      const welcome = await this.prisma.chatMessage.create({
        data: {
          content: encrypt(welcomeContent),
          role: 'assistant',
          familyId,
        },
      });
      return [{ ...welcome, content: welcomeContent }];
    }

    return decryptedMessages;
  }

  async sendMessage(userId: string, familyId: string, message: string, attachmentUrl?: string) {
    // 1. Process Task 301: AI Trigger Words
    if (message.startsWith('/')) {
      return this.handleSlashCommand(userId, familyId, message);
    }

    // 2. Save user message (Encrypted)
    const userMsg = await this.prisma.chatMessage.create({
      data: {
        content: encrypt(message),
        role: 'user',
        userId,
        familyId,
        attachmentUrl,
      },
    });

    // 3. Fetch Context (Task 292: Recent Transactions & Tasks)
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

    // 4. Get AI response (Context Aware)
    const recentHistory = await this.prisma.chatMessage.findMany({
      where: { familyId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Decrypt history for AI context
    const aiHistory = recentHistory.reverse().map(m => ({
      role: m.role,
      content: decrypt(m.content)
    }));

    // Task 302: Add directive for Smart Replies
    const aiResponse = await this.aiService.chat(message, aiHistory, context + "\n\nImportant: If appropriate, suggest 2-3 short 'Smart Reply' options for the user at the very end of your message in the format [SmartReply: Option 1|Option 2].");

    // 5. Save AI message (Encrypted)
    const assistantMsg = await this.prisma.chatMessage.create({
      data: {
        content: encrypt(aiResponse),
        role: 'assistant',
        familyId,
      },
    });

    return { ...assistantMsg, content: aiResponse };
  }

  // Task 301: Slash Commands
  private async handleSlashCommand(userId: string, familyId: string, cmd: string) {
    const rawCmd = cmd.split(' ')[0].toLowerCase();
    let response = "";

    if (rawCmd === '/zakat') {
      response = "Saya sedang menghitung zakat Anda... Silakan buka menu Zakat Hub untuk rincian lengkap. Ingin saya hitungkan simulasi sekarang?";
    } else if (rawCmd === '/status') {
      const wallets = await this.prisma.wallet.findMany({ where: { familyId } });
      const total = wallets.reduce((acc, w) => acc + Number(w.balance), 0);
      response = `Alhamdulillah, total saldo keluarga saat ini adalah Rp ${total.toLocaleString('id-ID')}.`;
    } else {
      response = `Maaf, command ${rawCmd} belum tersedia. Coba /zakat atau /status.`;
    }

    const msg = await this.prisma.chatMessage.create({
      data: {
        content: encrypt(response),
        role: 'assistant',
        familyId,
      },
    });

    return { ...msg, content: response };
  }

  // Task 299: Reaction System
  async toggleReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Pesan tidak ditemukan');

    const reactions = (message.reactions as any) || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [userId];
    } else {
      const idx = reactions[emoji].indexOf(userId);
      if (idx === -1) {
        reactions[emoji].push(userId);
      } else {
        reactions[emoji].splice(idx, 1);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      }
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { reactions },
    });
  }

  // Task 300: Pinned Messages
  async togglePin(messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Pesan tidak ditemukan');

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });
  }

  async getPinnedMessages(familyId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { familyId, isPinned: true },
      orderBy: { createdAt: 'desc' },
    });

    return messages.map(m => ({ ...m, content: decrypt(m.content) }));
  }

  // Task 284: Category Mapping Logic
  mapCategory(extractedCategory: string): string {
    const standardCategories = [
      'Pangan', 'Transportasi', 'Utilitas', 'Cicilan', 
      'Sedekah', 'Pendidikan', 'Hiburan', 'Kesehatan', 'Wakaf', 'Lainnya'
    ];

    const matched = standardCategories.find(
      cat => cat.toLowerCase() === extractedCategory.toLowerCase()
    );

    return matched || 'Lainnya';
  }
}
