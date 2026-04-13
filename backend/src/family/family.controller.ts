import { Controller, Get, Patch, Body, UseGuards, Delete, Param, Query, Post } from '@nestjs/common';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Get('me')
  async getMyFamily(@GetUser('familyId') familyId: string) {
    return this.familyService.getFamilyInfo(familyId);
  }

  @Get('check-name')
  async checkName(@Query('name') name: string) {
    return this.familyService.checkNameAvailability(name);
  }

  @Patch('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KEPALA_KELUARGA)
  async updateMyFamily(
    @GetUser('familyId') familyId: string,
    @Body('name') name: string,
  ) {
    return this.familyService.updateFamilyName(familyId, name);
  }

  @Post('leave')
  async leaveFamily(@GetUser('id') userId: string) {
    return this.familyService.leaveFamily(userId);
  }

  @Delete('members/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KEPALA_KELUARGA)
  async removeMember(
    @GetUser('familyId') familyId: string,
    @Param('id') memberId: string,
  ) {
    return this.familyService.removeMember(familyId, memberId);
  }
}
