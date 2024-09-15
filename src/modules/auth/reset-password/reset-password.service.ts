import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateResetPasswordDto } from './dto/update-reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '@/modules/user/user.entity';
import { PasswordResetToken } from '@/modules/password-reset-token/entities/password-reset-token.entity';
import { MailService } from '@/mail/reset-password-mail/mail.service';

@Injectable()
export class ResetPasswordService {
  constructor(private mailService: MailService) {}

  async sendMailResetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<any> {
    const { email } = resetPasswordDto;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new HttpException(
        'The email address you entered does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const token = crypto.randomBytes(30).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    await PasswordResetToken.upsert(
      { email, token: hashedToken },
      { conflictPaths: ['email'] },
    );

    await this.mailService.sendResetPasswordMail(user, token, 'reset-password');

    return { message: 'A link has been sent to the email address you entered' };
  }

  async passwordResetUpdate(
    updateResetPasswordDto: UpdateResetPasswordDto,
  ): Promise<any> {
    const { token, password } = updateResetPasswordDto;
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
    });

    if (!resetToken) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await User.findOne({
      where: { email: resetToken.email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isTokenValid = await bcrypt.compare(token, resetToken.token);
    if (!isTokenValid) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = await bcrypt.hash(password, 10);
    user.is_change_password_first = true; // Adjust based on your enum logic
    await User.save(user);

    await PasswordResetToken.delete({ email: resetToken.email });

    return { message: 'Updated successfully' };
  }
}
