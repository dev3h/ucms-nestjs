import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ResponseUtil } from '@/utils/response-util';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly i18n: I18nService,
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
  async sendResetPasswordMail(data: any) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'Reset Password Mail',
        template: 'reset-password-mail',
        context: data,
      });
      this.logger.log(`Email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.email}`, error.stack);
      return ResponseUtil.sendErrorResponse('Failed to send email', error);
    }
  }
  async sendSSOResetPasswordMail(data: any) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'SSO Reset Password Mail',
        template: 'sso-reset-password-mail',
        context: data,
      });
      this.logger.log(`Email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.email}`, error.stack);
      return ResponseUtil.sendErrorResponse('Failed to send email', error);
    }
  }
  async sendReset2FAMail(data: any) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'Reset 2FA Mail',
        template: 'reset-2fa-mail',
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
  async addSendResetPasswordMailJob(data) {
    this.logger.log(`Adding job to queue with data: ${JSON.stringify(data)}`);
    await this.mailQueue.add('sendResetPasswordMail', data);
  }
  async addSendSSOResetPasswordMailJob(data) {
    this.logger.log(`Adding job to queue with data: ${JSON.stringify(data)}`);
    await this.mailQueue.add('sendSSOResetPasswordMail', data);
  }
  async addSendReset2FAMailJob(data) {
    this.logger.log(`Adding job to queue with data: ${JSON.stringify(data)}`);
    await this.mailQueue.add('sendReset2FAMail', data);
  }
}
