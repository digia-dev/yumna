import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { ZakatModule } from './zakat/zakat.module';
import { FinanceModule } from './finance/finance.module';
import { TasksModule } from './tasks/tasks.module';
import { HealthController } from './app.health.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { InvitationsModule } from './invitations/invitations.module';
import { FamilyModule } from './family/family.module';
import { BudgetingModule } from './budgeting/budgeting.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { ReligiModule } from './religi/religi.module';
import { SyuraModule } from './syura/syura.module';
import { ChatModule } from './chat/chat.module';
import { ScheduleModule } from './schedule/schedule.module';
import { GamificationModule } from './gamification/gamification.module';
import { BillsModule } from './bills/bills.module';
import { EventsModule } from './events/events.module';
import { NotesModule } from './notes/notes.module';
import { WafMiddleware } from './common/middleware/waf.middleware';
import { DiskMonitorService } from './common/monitoring/disk-monitor.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    PrismaModule,
    AuthModule,
    RedisModule,
    ZakatModule,
    FinanceModule,
    TasksModule,
    BillsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    UploadsModule,
    InvitationsModule,
    FamilyModule,
    BudgetingModule,
    MailModule,
    UsersModule,
    AiModule,
    ReligiModule,
    SyuraModule,
    ChatModule,
    ScheduleModule,
    GamificationModule,
    EventsModule,
    NotesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    DiskMonitorService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 424/425 – Apply WAF + rate-limit + payload scanner to all routes
    consumer.apply(WafMiddleware).forRoutes('*');
  }
}
