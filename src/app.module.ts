import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  Optional,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { Queue } from 'bull';
import * as path from 'path';
import {
  AcceptLanguageResolver,
  QueryResolver,
  I18nModule,
  HeaderResolver,
} from 'nestjs-i18n';

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
import { LanguageCheckMiddleware } from './common/middleware/language-check.middleware';
import { SystemTokenModule } from './modules/system-token/system-token.module';
import { IsUniqueConstraint } from './share/validation/unique/is-unique-constraint';
import { IsExistsConstraint } from './share/validation/exist/is-exists-constraint';
import { TwoFactorAuthenticationModule } from './modules/auth/twoFactor/two-factor-authentication.module';
import { RedisModule } from './modules/redis/redis.module';
import { MailModule } from './mail/mail.module';
import { UserLoginHistoryModule } from './modules/user-login-history/user-login-history.module';
import { SystemClientSecretModule } from './modules/system-client-secret/system-client-secret.module';
import { DeviceLoginHistoryModule } from './modules/device-login-history/device-login-history.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { NestjsFingerprintModule } from 'nestjs-fingerprint';
import { DeviceSessionModule } from './modules/device-session/device-session.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { SystemController } from './modules/system/system.controller';
import { SubsystemController } from './modules/subsystem/subsystem.controller';
import { ModuleController } from './modules/module/module.controller';
import { ActionController } from './modules/action/action.controller';
import { RoleController } from './modules/role/role.controller';
import { UserController } from './modules/user/user.controller';
import { PermissionController } from './modules/permission/permission.controller';
import { LoggerModule } from './modules/logger/logger.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { JobModule } from './job/job.module';
import { setupBullBoard } from './bull-board.setup';

@Module({
  imports: [
    NestjsFingerprintModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 1000),
          limit: config.get('THROTTLE_LIMIT', 10),
        },
      ],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
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
          // username: configService.get('REDIS_USERNAME'),
          port: Number(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'mail' }, { name: 'job-custom' }),
    // setting Schedule
    ScheduleModule.forRoot(),
    DatabaseConfigModule,
    EventEmitterModule.forRoot(),
    RedisModule,
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
    SystemTokenModule,
    TwoFactorAuthenticationModule,
    JobModule,
    MailModule,
    UserLoginHistoryModule,
    SystemClientSecretModule,
    DeviceLoginHistoryModule,
    DeviceSessionModule,
    LoggerModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    IsUniqueConstraint,
    IsExistsConstraint,
  ],
  exports: [BullModule],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(
    @Optional() @InjectQueue('mail') private readonly mailQueue?: Queue,
    @Optional() @InjectQueue('job-custom') private readonly jobQueue?: Queue,
  ) {}
  async onModuleInit() {
    console.log('Mail queue ready:', !!this.mailQueue);
    console.log('Job queue ready:', !!this.jobQueue);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
    consumer.apply(LanguageCheckMiddleware).forRoutes('*');
    consumer
      .apply(ApiTokenCheckMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: '/admin/queues', method: RequestMethod.ALL })
      .forRoutes(
        SystemController,
        SubsystemController,
        ModuleController,
        ActionController,
        RoleController,
        PermissionController,
        DashboardController,
      );
  }
  configureApp(app: INestApplication) {
    setupBullBoard(app, [this.jobQueue, this.mailQueue]);
  }
}
