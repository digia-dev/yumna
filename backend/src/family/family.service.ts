import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async getFamilyInfo(familyId: string) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }

  async checkNameAvailability(name: string) {
    const existing = await this.prisma.family.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return { available: !existing };
  }

  async updateFamilyName(familyId: string, name: string) {
    return this.prisma.family.update({
      where: { id: familyId },
      data: { name },
    });
  }

  async removeMember(familyId: string, memberId: string) {
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member || member.familyId !== familyId) {
      throw new NotFoundException('Member not found in this family');
    }

    if (member.role === 'KEPALA_KELUARGA') {
      throw new BadRequestException('Cannot remove the Head of Family');
    }

    return this.prisma.user.update({
      where: { id: memberId },
      data: {
        familyId: null,
        role: 'ANAK',
      },
    });
  }

  async leaveFamily(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.familyId) {
      throw new BadRequestException('User is not in a family');
    }

    if (user.role === 'KEPALA_KELUARGA') {
      throw new BadRequestException(
        'Head of Family cannot leave. Please transfer ownership or delete family.',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        familyId: null,
        role: 'ANAK',
      },
    });
  }
}
