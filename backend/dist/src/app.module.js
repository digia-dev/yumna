"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const nestjs_pino_1 = require("nestjs-pino");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const redis_module_1 = require("./redis/redis.module");
const zakat_module_1 = require("./zakat/zakat.module");
const finance_module_1 = require("./finance/finance.module");
const tasks_module_1 = require("./tasks/tasks.module");
const app_health_controller_1 = require("./app.health.controller");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const uploads_module_1 = require("./uploads/uploads.module");
const invitations_module_1 = require("./invitations/invitations.module");
const family_module_1 = require("./family/family.module");
const budgeting_module_1 = require("./budgeting/budgeting.module");
const mail_module_1 = require("./mail/mail.module");
const users_module_1 = require("./users/users.module");
const ai_module_1 = require("./ai/ai.module");
const religi_module_1 = require("./religi/religi.module");
const syura_module_1 = require("./syura/syura.module");
const chat_module_1 = require("./chat/chat.module");
const schedule_module_1 = require("./schedule/schedule.module");
const gamification_module_1 = require("./gamification/gamification.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: process.env.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty' }
                        : undefined,
                },
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            redis_module_1.RedisModule,
            zakat_module_1.ZakatModule,
            finance_module_1.FinanceModule,
            tasks_module_1.TasksModule,
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            uploads_module_1.UploadsModule,
            invitations_module_1.InvitationsModule,
            family_module_1.FamilyModule,
            budgeting_module_1.BudgetingModule,
            mail_module_1.MailModule,
            users_module_1.UsersModule,
            ai_module_1.AiModule,
            religi_module_1.ReligiModule,
            syura_module_1.SyuraModule,
            chat_module_1.ChatModule,
            schedule_module_1.ScheduleModule,
            gamification_module_1.GamificationModule,
        ],
        controllers: [app_controller_1.AppController, app_health_controller_1.HealthController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map