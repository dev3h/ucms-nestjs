import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/user.entity';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { UserModule } from '@/modules/user/user.module';
import { AuthModule } from '../login/auth.module';
import { LocalStrategy } from '../local.strategy';
import { JwtStrategy } from '../jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@/config/jwt.config';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PassportModule,
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthenticationService, LocalStrategy, JwtStrategy],
})
export class TwoFactorAuthenticationModule {}
