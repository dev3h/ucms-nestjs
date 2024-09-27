import { Module, Scope } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { System } from './entities/system.entity';
import { SystemFilter } from './filters/system.filter';
import { REQUEST } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([System])],
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
