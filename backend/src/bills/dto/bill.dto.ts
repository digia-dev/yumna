import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { RecurrenceType } from '@prisma/client';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  autoPay?: boolean;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  walletId: string;
}

export class UpdateBillDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  autoPay?: boolean;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  walletId?: string;
}
