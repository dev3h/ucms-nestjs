import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordController } from './reset-password.controller';
import { UserModule } from '@/modules/user/user.module';
import { PasswordResetTokenModule } from '@/modules/password-reset-token/password-reset-token.module';
import { MailModule } from '@/mail/reset-password-mail/mail.module';

@Module({
  imports: [UserModule, PasswordResetTokenModule, MailModule],
  providers: [ResetPasswordService],
  controllers: [ResetPasswordController],
})
export class ResetPasswordModule {}
