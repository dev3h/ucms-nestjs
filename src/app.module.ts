import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ApiTokenCheckMiddleware } from './common/middleware/api-token-check.middleware';
import { SystemModule } from './modules/system/system.module';
import { SubsystemModule } from './modules/subsystem/subsystem.module';
import { ModuleModule } from './modules/module/module.module';
import { ActionModule } from './modules/action/action.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PasswordResetTokenModule } from './modules/password-reset-token/password-reset-token.module';
import LogsMiddleware from './utils/logs.middleware';
// import { SeederService } from './database/seeder.service';
import { SeederModule } from './database/seeder.module';
import { DatabaseConfigModule } from './database/database-config.module';

@Module({
  imports: [
    // setting Queue for BullModule
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
      }),
      inject: [ConfigService],
    }),
    // setting Schedule
    ScheduleModule.forRoot(),
    DatabaseConfigModule,
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    SystemModule,
    SubsystemModule,
    ModuleModule,
    ActionModule,
    RoleModule,
    PermissionModule,
    PasswordResetTokenModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // constructor(private readonly seederService: SeederService) {}

  // async onModuleInit() {
  //   await this.seederService.runDatabaseSeeder();
  // }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
    consumer
      .apply(ApiTokenCheckMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
