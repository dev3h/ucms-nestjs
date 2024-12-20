import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from '../strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { jwtConfig } from '@/config/jwt.config';
import { UserModule } from '../../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { System } from '@/modules/system/entities/system.entity';
import { SystemToken } from '@/modules/system-token/entities/system-token.entity';
import { User } from '@/modules/user/user.entity';
import { RedisModule } from '@/modules/redis/redis.module';
import { JwtUserStrategy } from '../strategy/jwt-user.strategy';
import { SystemModule } from '@/modules/system/system.module';
import { CheckClientIdRedirectUriMiddleware } from '@/common/middleware/check-client-id-redirect-uri.middleware';
import { UserLoginHistoryModule } from '@/modules/user-login-history/user-login-history.module';
import { SystemClientSecret } from '@/modules/system-client-secret/entities/system-client-secret.entity';
import { DeviceLoginHistoryModule } from '@/modules/device-login-history/device-login-history.module';
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';
import { Action } from '@/modules/action/entities/action.entity';
import { Module as ModuleSubsystem } from '@/modules/module/entities/module.entity';
import { DeviceSessionModule } from '@/modules/device-session/device-session.module';
import { RedisService } from '@/modules/redis/redis.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    RedisModule,
    SystemModule,
    UserLoginHistoryModule,
    DeviceLoginHistoryModule,
    JwtModule.registerAsync(jwtConfig),
    forwardRef(() => DeviceSessionModule),
    // JwtModule.register({
    //   secret: process.env.JWT_USER_SECRET || 'userSecret', // JWT for users
    //   signOptions: { expiresIn: '1h' },
    // }),
    // JwtModule.register({
    //   secret: process.env.JWT_ADMIN_SECRET || 'adminSecret', // JWT for admins
    //   signOptions: { expiresIn: '1h' },
    // }),
    TypeOrmModule.forFeature([
      System,
      Subsystem,
      ModuleSubsystem,
      Action,
      SystemToken,
      User,
      SystemClientSecret,
      DeviceLoginHistoryModule,
    ]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtUserStrategy,
    RedisService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtUserStrategy],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckClientIdRedirectUriMiddleware).forRoutes(
      { path: 'auth/check-email-exist', method: RequestMethod.POST },
      {
        path: 'auth/oauth-ucms/login',
        method: RequestMethod.POST,
      },
      {
        path: 'auth/sso-ucms/confirm',
        method: RequestMethod.POST,
      },
    );
  }
}
