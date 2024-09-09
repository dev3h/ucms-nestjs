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
import * as path from 'path';
import { AcceptLanguageResolver, QueryResolver, I18nModule, HeaderResolver } from 'nestjs-i18n';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/login/auth.module';
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
import { ResetPasswordModule } from './modules/auth/reset-password/reset-password.module';
import { MailModule } from './mail/reset-password-mail/mail.module';
import { LanguageCheckMiddleware } from './common/middleware/language-check.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    // setup multi language
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    // setting Queue for BullModule
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          username: configService.get('REDIS_USERNAME'),
          port: Number(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD'),
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
    ResetPasswordModule,
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
    consumer.apply(LanguageCheckMiddleware).forRoutes('*');
    consumer
      .apply(ApiTokenCheckMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
