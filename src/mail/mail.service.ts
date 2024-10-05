import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ResponseUtil } from '@/utils/response-util';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    @InjectQueue('mail') private readonly mailQueue: Queue,
  ) {}

  async sendUserConfirmation(user: any, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './template/confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        url,
      },
    });
  }
  async sendCreateUserMail(data: any) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'Create User Mail',
        template: 'create-user-mail',
        context: data,
      });
      this.logger.log(`Email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.email}`, error.stack);
      return ResponseUtil.sendErrorResponse('Failed to send email', error);
    }
  }
  async addSendMailJob(data) {
    this.logger.log(`Adding job to queue with data: ${JSON.stringify(data)}`);
    await this.mailQueue.add('sendMail', data);
  }
}
