import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateResetPasswordDto } from './dto/update-reset-password.dto';
import { ApiTags } from '@nestjs/swagger';
import { SSOResetPasswordDto } from '../dto/sso-reset-password.dto';

@ApiTags('Reset Password')
@Controller('auth')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('forgot-password')
  @HttpCode(200)
  async sendMailResetPassword(@Body() body: ResetPasswordDto) {
    return await this.resetPasswordService.sendMailResetPassword(body);
  }

  @Post('/sso-ucms/forgot-password')
  @HttpCode(200)
  sendMailSSOResetPassword(@Body() body: SSOResetPasswordDto) {
    return this.resetPasswordService.ssoSendMailResetPassword(body);
  }

  @Post('reset-password')
  @HttpCode(200)
  async passwordResetUpdate(@Body() body: UpdateResetPasswordDto) {
    return await this.resetPasswordService.passwordResetUpdate(body);
  }

  @Post('/sso-ucms/password/verify-otp-code')
  @HttpCode(200)
  ssoPasswordVerifyOTPCode(@Body() body: SSOResetPasswordDto) {
    return this.resetPasswordService.verifyOtpCode(body);
  }

  @Post('/sso-ucms/reset-password')
  @HttpCode(200)
  ssoPasswordResetUpdate(@Body() body: UpdateResetPasswordDto) {
    return this.resetPasswordService.ssoPasswordResetUpdate(body);
  }
}
