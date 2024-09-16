import { Module, Scope } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserFilter } from './filters/user.filter';
import { UserPermissionFilter } from './filters/user-permission.filter';
import { Permission } from '../permission/entities/permission.entity';
import { UserHasPermission } from './user-has-permission.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Permission, UserHasPermission, Role]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserFilter,
      useClass: UserFilter,
      scope: Scope.REQUEST,
    },
    {
      provide: UserPermissionFilter,
      useClass: UserPermissionFilter,
      scope: Scope.REQUEST,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
