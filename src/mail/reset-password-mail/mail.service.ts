import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@/modules/user/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordMail(user: User, token: string, route: string) {
    const url = `${process.env.APP_URL}/${route}?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      template: '../template/reset-password', // Specify your email template
      context: {
        name: user.name,
        url,
      },
    });
  }
}
