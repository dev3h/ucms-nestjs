import { Module } from '@nestjs/common';
import { PasswordResetTokenService } from './password-reset-token.service';
import { PasswordResetTokenController } from './password-reset-token.controller';

@Module({
  controllers: [PasswordResetTokenController],
  providers: [PasswordResetTokenService],
})
export class PasswordResetTokenModule {}
