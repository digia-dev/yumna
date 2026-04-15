import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
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

  // 359 – Private Tasks
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  // 360 – Task Estimation (minutes)
  @IsInt()
  @Min(0)
  @Max(10080) // max 1 week
  @IsOptional()
  estimatedMinutes?: number;

  // 366 – Color Coding
  @IsString()
  @IsOptional()
  color?: string;

  // 361 – Weekly Routine type
  @IsString()
  @IsOptional()
  recurringType?: string;

  // 362 – Holiday Planner date
  @IsDateString()
  @IsOptional()
  holidayDate?: string;
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

  // 359
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  // 360
  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedMinutes?: number;

  // 366
  @IsString()
  @IsOptional()
  color?: string;

  // 361
  @IsString()
  @IsOptional()
  recurringType?: string;

  // 362
  @IsDateString()
  @IsOptional()
  holidayDate?: string;
}
