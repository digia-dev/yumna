import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(creatorId: string, familyId: string, dto: CreateTaskDto): Promise<{
        creator: {
            name: string;
        };
        assignee: {
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: string;
        assigneeId: string | null;
        isCompleted: boolean;
        creatorId: string;
    }>;
    findAll(familyId: string): Promise<({
        creator: {
            name: string;
        };
        assignee: {
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: string;
        assigneeId: string | null;
        isCompleted: boolean;
        creatorId: string;
    })[]>;
    update(taskId: string, familyId: string, dto: UpdateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: string;
        assigneeId: string | null;
        isCompleted: boolean;
        creatorId: string;
    }>;
    remove(taskId: string, familyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: string;
        assigneeId: string | null;
        isCompleted: boolean;
        creatorId: string;
    }>;
}
