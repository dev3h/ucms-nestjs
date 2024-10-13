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
import { System } from '../system/entities/system.entity';
import { MailModule } from '@/mail/mail.module';
import { Subsystem } from '../subsystem/entities/subsystem.entity';
import { Action } from '../action/entities/action.entity';
import { Module as ModuleEntity } from '../module/entities/module.entity';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([
      User,
      Permission,
      UserHasPermission,
      Role,
      System,
      Subsystem,
      ModuleEntity,
      Action,
    ]),
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
