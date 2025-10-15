import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsDate } from 'class-validator';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  assignedToId?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDate()
  @IsOptional()
  completedAt?: Date;
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

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  assignedToId?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDate()
  @IsOptional()
  completedAt?: Date;
}
