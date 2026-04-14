import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    create(userId: string, familyId: string, dto: CreateTaskDto): Promise<{
        assignee: {
            id: string;
            name: string;
            image: string | null;
        } | null;
        creator: {
            id: string;
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
        category: string | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        creatorId: string;
    }>;
    findAll(familyId: string): Promise<({
        assignee: {
            id: string;
            name: string;
            image: string | null;
        } | null;
        creator: {
            id: string;
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
        category: string | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        creatorId: string;
    })[]>;
    update(id: string, familyId: string, dto: UpdateTaskDto): Promise<{
        assignee: {
            id: string;
            name: string;
            image: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        category: string | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        creatorId: string;
    }>;
    remove(id: string, familyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        familyId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        category: string | null;
        description: string | null;
        title: string;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        creatorId: string;
    }>;
}
