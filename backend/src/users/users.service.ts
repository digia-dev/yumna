import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateStatus(userId: string, status: string, icon?: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status,
        statusIcon: icon,
      },
      select: {
        id: true,
        status: true,
        statusIcon: true,
      },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        status: true,
        statusIcon: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }
}
