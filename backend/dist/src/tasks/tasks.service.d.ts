import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(creatorId: string, familyId: string, dto: CreateTaskDto): Promise<{
        assignee: {
            name: string;
        } | null;
        creator: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    }>;
    findAll(familyId: string): Promise<({
        assignee: {
            name: string;
        } | null;
        creator: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    })[]>;
    update(taskId: string, familyId: string, dto: UpdateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    }>;
    remove(taskId: string, familyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    }>;
}
