import { Module, Scope } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionFilter } from './filters/permission.filter';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    {
      provide: PermissionFilter,
      useClass: PermissionFilter,
      scope: Scope.REQUEST,
    },
  ],
  exports: [PermissionService],
})
export class PermissionModule {}
