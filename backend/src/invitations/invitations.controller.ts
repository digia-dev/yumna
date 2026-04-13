import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.KEPALA_KELUARGA)
  async create(
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(familyId, dto);
  }

  @Post('accept')
  async accept(
    @GetUser('id') userId: string,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitationsService.accept(userId, dto.token);
  }

  @Get()
  async getPending(@GetUser('familyId') familyId: string) {
    return this.invitationsService.findByFamily(familyId);
  }
}
