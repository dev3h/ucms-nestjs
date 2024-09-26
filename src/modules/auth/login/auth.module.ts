import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    UserModule,
    PassportModule,
    RedisModule,
    JwtModule.registerAsync(jwtConfig),
    // JwtModule.register({
    //   secret: process.env.JWT_USER_SECRET || 'userSecret', // JWT for users
    //   signOptions: { expiresIn: '1h' },
    // }),
    // JwtModule.register({
    //   secret: process.env.JWT_ADMIN_SECRET || 'adminSecret', // JWT for admins
    //   signOptions: { expiresIn: '1h' },
    // }),
    TypeOrmModule.forFeature([System, SystemToken, User]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtUserStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtUserStrategy],
})
export class AuthModule {}
