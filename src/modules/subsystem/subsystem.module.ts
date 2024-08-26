import { Module } from '@nestjs/common';
import { SubsystemService } from './subsystem.service';
import { SubsystemController } from './subsystem.controller';

@Module({
  controllers: [SubsystemController],
  providers: [SubsystemService],
})
export class SubsystemModule {}
