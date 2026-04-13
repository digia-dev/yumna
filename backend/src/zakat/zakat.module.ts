import { Module } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { ZakatController } from './zakat.controller';
import { InheritanceService } from './inheritance.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ZakatService, InheritanceService],
  controllers: [ZakatController],
  exports: [ZakatService, InheritanceService],
})
export class ZakatModule {}
