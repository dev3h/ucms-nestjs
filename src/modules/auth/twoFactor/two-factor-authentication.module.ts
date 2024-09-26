import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/user.entity';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { UserModule } from '@/modules/user/user.module';
import { AuthModule } from '../login/auth.module';
import { LocalStrategy } from '../strategy/local.strategy';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@/config/jwt.config';
import { AuthService } from '../login/auth.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PassportModule,
    JwtModule.registerAsync(jwtConfig),
    // JwtModule.register({
    //   secret: process.env.JWT_USER_SECRET || 'userSecret', // JWT for users
    //   signOptions: { expiresIn: '1h' },
    // }),
    // JwtModule.register({
    //   secret: process.env.JWT_ADMIN_SECRET || 'adminSecret', // JWT for admins
    //   signOptions: { expiresIn: '1h' },
    // }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [TwoFactorAuthenticationController],
  providers: [
    TwoFactorAuthenticationService,
    // AuthService,
    // LocalStrategy,
    // JwtStrategy,
    // JwtUserStrategy,
    // JwtAdminStrategy,
  ],
})
export class TwoFactorAuthenticationModule {}
