import { IsString, IsOptional, IsDateString, IsNotEmpty, IsEnum, IsBoolean, IsInt } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsBoolean()
  @IsOptional()
  isGoal?: boolean;

  @IsInt()
  @IsOptional()
  goalProgress?: number;

  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @IsString()
  @IsOptional()
  templateName?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  billId?: string;

  @IsOptional()
  dependencyIds?: string[];
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @IsOptional()
  goalProgress?: number;

  @IsBoolean()
  @IsOptional()
  isGoal?: boolean;

  @IsString()
  @IsOptional()
  billId?: string;

  @IsOptional()
  dependencyIds?: string[];
}
