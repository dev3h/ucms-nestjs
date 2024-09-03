import { Body, Controller, Post } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateResetPasswordDto } from './dto/update-reset-password.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reset Password')
@Controller('reset-password')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('send-mail')
  async sendMailResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.resetPasswordService.sendMailResetPassword(
      resetPasswordDto,
    );
  }

  @Post('update')
  async passwordResetUpdate(
    @Body() updateResetPasswordDto: UpdateResetPasswordDto,
  ) {
    return await this.resetPasswordService.passwordResetUpdate(
      updateResetPasswordDto,
    );
  }
}
