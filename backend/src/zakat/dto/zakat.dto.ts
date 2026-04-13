import { IsNumber, IsString, IsEnum, Min, IsNotEmpty, IsOptional } from 'class-validator';

export class CalculateZakatDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: 'MAAL' | 'PROFESSION' | 'FITRAH';
}

export class LogZakatDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  recipient?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
