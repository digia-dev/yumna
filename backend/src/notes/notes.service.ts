import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNoteDto {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> {}

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(familyId: string, authorId: string, dto: CreateNoteDto) {
    return this.prisma.familyNote.create({
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category ?? 'Umum',
        tags: dto.tags ? JSON.stringify(dto.tags) : '[]',
        isPinned: dto.isPinned ?? false,
        color: dto.color,
        familyId,
        authorId,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });
  }

  async findAll(familyId: string, search?: string) {
    const notes = await this.prisma.familyNote.findMany({
      where: {
        familyId,
        isDeleted: false,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { author: { select: { id: true, name: true, image: true } } },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });

    return notes.map((n) => ({
      ...n,
      tags: n.tags ? JSON.parse(n.tags as string) : [],
    }));
  }

  async findOne(id: string, familyId: string) {
    const note = await this.prisma.familyNote.findFirst({
      where: { id, familyId, isDeleted: false },
      include: { author: { select: { id: true, name: true, image: true } } },
    });
    if (!note) throw new NotFoundException('Note not found');
    return { ...note, tags: note.tags ? JSON.parse(note.tags as string) : [] };
  }

  async update(id: string, familyId: string, authorId: string, dto: UpdateNoteDto) {
    await this.findOne(id, familyId);
    return this.prisma.familyNote.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        tags: dto.tags ? JSON.stringify(dto.tags) : undefined,
        isPinned: dto.isPinned,
        color: dto.color,
        lastEditedById: authorId,
        updatedAt: new Date(),
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });
  }

  async remove(id: string, familyId: string) {
    await this.findOne(id, familyId);
    return this.prisma.familyNote.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async togglePin(id: string, familyId: string) {
    const note = await this.findOne(id, familyId);
    return this.prisma.familyNote.update({
      where: { id },
      data: { isPinned: !note.isPinned },
    });
  }
}
