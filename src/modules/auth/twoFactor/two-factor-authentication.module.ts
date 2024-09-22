import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/user.entity';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { UserModule } from '@/modules/user/user.module';
import { AuthModule } from '../login/auth.module';

@Module({
  imports: [UserModule, AuthModule, TypeOrmModule.forFeature([User])],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthenticationService],
})
export class TwoFactorAuthenticationModule {}
