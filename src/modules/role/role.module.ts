import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { System } from '../system/entities/system.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, System])],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
