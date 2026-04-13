import { Module } from '@nestjs/common';
import { ReligiService } from './religi.service';
import { ReligiController } from './religi.controller';

@Module({
  providers: [ReligiService],
  controllers: [ReligiController],
  exports: [ReligiService]
})
export class ReligiModule {}
