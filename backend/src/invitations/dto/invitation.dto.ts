import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class AcceptInvitationDto {
  @IsNotEmpty()
  token: string;
}
