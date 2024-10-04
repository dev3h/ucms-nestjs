import { Module, Scope } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { System } from '../system/entities/system.entity';
import { RoleFilter } from '../user/filters/role.filter';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, System])],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: RoleFilter,
      useClass: RoleFilter,
      scope: Scope.REQUEST,
    },
  ],
})
export class RoleModule {}
