import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateInvitationDto } from './dto/invitation.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(familyId: string, dto: CreateInvitationDto) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser?.familyId) {
      throw new BadRequestException('User is already a member of a family');
    }

    // 2. Generate secure token (8 chars for easy typing)
    const token = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

    // 3. Get family info for email
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
    });

    // 4. Save invitation
    const invitation = await this.prisma.familyInvitation.create({
      data: {
        email: dto.email,
        familyId,
        role: dto.role,
        token,
        expiresAt,
      },
    });

    // 5. Send Email
    try {
      await this.mailService.sendInvitation(
        dto.email,
        family?.name || 'Yumna Family',
        token,
      );
    } catch (e) {
      console.error('Failed to send invitation email:', e);
      // We still return invitation, user can copy code from UI if email fails
    }

    return invitation;
  }

  async accept(userId: string, token: string) {
    const invitation = await this.prisma.familyInvitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.accepted) {
      throw new BadRequestException('Invalid or already used invitation');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if user already has a family
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.familyId) {
      throw new BadRequestException('You are already a member of a family');
    }

    // Update user family and mark invitation as accepted
    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          familyId: invitation.familyId,
          role: invitation.role,
        },
      });

      return tx.familyInvitation.update({
        where: { id: invitation.id },
        data: { accepted: true },
      });
    });
  }

  async findByFamily(familyId: string) {
    return this.prisma.familyInvitation.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
