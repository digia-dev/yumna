import { Module } from '@nestjs/common';
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
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
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
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    UploadsModule,
    InvitationsModule,
    FamilyModule,
    BudgetingModule,
    MailModule,
    UsersModule,
    AiModule,
    ReligiModule,
    ChatModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
