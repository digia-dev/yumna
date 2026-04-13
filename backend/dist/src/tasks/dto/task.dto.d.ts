export declare class CreateTaskDto {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    assigneeId?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    isCompleted?: boolean;
    dueDate?: string;
    priority?: string;
    assigneeId?: string;
}
