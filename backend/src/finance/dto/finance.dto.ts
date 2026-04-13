import { IsNumber, IsString, IsEnum, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  walletId: string;

  @IsOptional()
  metadata?: any;
}

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  initialBalance?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
