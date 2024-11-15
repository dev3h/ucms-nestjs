import { Module, Scope } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { System } from './entities/system.entity';
import { SystemFilter } from './filters/system.filter';
import { SystemClientSecret } from '../system-client-secret/entities/system-client-secret.entity';
import { Subsystem } from '../subsystem/entities/subsystem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([System, SystemClientSecret, Subsystem])],
  controllers: [SystemController],
  providers: [
    SystemService,
    {
      provide: SystemFilter,
      useClass: SystemFilter,
      scope: Scope.REQUEST,
    },
  ],
  exports: [SystemService],
})
export class SystemModule {}
