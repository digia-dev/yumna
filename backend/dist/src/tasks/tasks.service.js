"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(creatorId, familyId, dto) {
        return this.prisma.task.create({
            data: {
                ...dto,
                creatorId,
                familyId,
            },
            include: {
                assignee: { select: { name: true } },
                creator: { select: { name: true } },
            },
        });
    }
    async findAll(familyId) {
        return this.prisma.task.findMany({
            where: { familyId, isDeleted: false },
            include: {
                assignee: { select: { name: true } },
                creator: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(taskId, familyId, dto) {
        const task = await this.prisma.task.findFirst({
            where: { id: taskId, familyId },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return this.prisma.task.update({
            where: { id: taskId },
            data: dto,
        });
    }
    async remove(taskId, familyId) {
        const task = await this.prisma.task.findFirst({
            where: { id: taskId, familyId },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return this.prisma.task.update({
            where: { id: taskId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map