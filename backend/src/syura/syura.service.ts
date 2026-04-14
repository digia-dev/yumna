import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyuraService {
  constructor(private prisma: PrismaService) {}

  async getNotes(familyId: string) {
    return this.prisma.syuraNote.findMany({
      where: { familyId },
      orderBy: { date: 'desc' }
    });
  }

  async createNote(familyId: string, data: { title: string; content: string; attendees: string[] }) {
    return this.prisma.syuraNote.create({
      data: {
        ...data,
        familyId
      }
    });
  }

  async getTopics(familyId: string) {
    return this.prisma.syuraTopic.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTopic(familyId: string, title: string) {
    return this.prisma.syuraTopic.create({
      data: { title, familyId }
    });
  }

  async toggleTopic(id: string, familyId: string) {
    const topic = await this.prisma.syuraTopic.findFirst({
      where: { id, familyId }
    });
    if (!topic) return null;

    return this.prisma.syuraTopic.update({
      where: { id },
      data: { isCompleted: !topic.isCompleted }
    });
  }
}
