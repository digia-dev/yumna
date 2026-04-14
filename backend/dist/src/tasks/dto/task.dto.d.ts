import { TaskStatus, TaskPriority } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    category?: string;
    assigneeId?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: string;
    priority?: TaskPriority;
    category?: string;
    assigneeId?: string;
}
