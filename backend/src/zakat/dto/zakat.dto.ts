import { IsNumber, IsString, IsEnum, Min, IsNotEmpty } from 'class-validator';

export class CalculateZakatDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: 'MAAL' | 'PROFESSION';
}

export class LogZakatDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: string;
}
