import { Module, Scope } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as ModuleEntity } from './entities/module.entity';
import { ModuleFilter } from './filters/module.filter';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity])],
  controllers: [ModuleController],
  providers: [
    ModuleService,
    {
      provide: ModuleFilter,
      useClass: ModuleFilter,
      scope: Scope.REQUEST,
    },
  ],
  exports: [ModuleService],
})
export class ModuleModule {}
