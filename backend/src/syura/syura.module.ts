import { Module } from '@nestjs/common';
import { SyuraService } from './syura.service';
import { SyuraController } from './syura.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SyuraService],
  controllers: [SyuraController],
})
export class SyuraModule {}
