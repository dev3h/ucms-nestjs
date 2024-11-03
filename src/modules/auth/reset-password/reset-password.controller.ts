import { Body, Controller, Post } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateResetPasswordDto } from './dto/update-reset-password.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reset Password')
@Controller('auth')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('forgot-password')
  async sendMailResetPassword(@Body() body: ResetPasswordDto) {
    return await this.resetPasswordService.sendMailResetPassword(body);
  }

  @Post('reset-password')
  async passwordResetUpdate(@Body() body: UpdateResetPasswordDto) {
    return await this.resetPasswordService.passwordResetUpdate(body);
  }
}
