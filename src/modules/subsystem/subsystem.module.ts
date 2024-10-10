import { Module, Scope } from '@nestjs/common';
import { SubsystemService } from './subsystem.service';
import { SubsystemController } from './subsystem.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subsystem } from './entities/subsystem.entity';
import { SubSystemFilter } from './filters/subsystem.filter';

@Module({
  imports: [TypeOrmModule.forFeature([Subsystem])],
  controllers: [SubsystemController],
  providers: [
    SubsystemService,
    {
      provide: SubSystemFilter,
      useClass: SubSystemFilter,
      scope: Scope.REQUEST,
    },
  ],
  exports: [SubsystemService],
})
export class SubsystemModule {}
