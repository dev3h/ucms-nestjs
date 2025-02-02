import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from './mail.service';
import { Logger } from '@nestjs/common';

@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);
  constructor(private readonly mailService: MailService) {}

  @Process('sendMail')
  async handleSendMail(job: Job) {
    this.logger.log(
      `Processing job ${job.id} with data: ${JSON.stringify(job.data)}`,
    );
    const dataSend = job.data;
    await this.mailService.sendCreateUserMail(dataSend);
    this.logger.log(`Completed job ${job.id}`);
  }

  @Process('sendResetPasswordMail')
  async handleSendResetPasswordMail(job: Job) {
    this.logger.log(
      `Processing job ${job.id} with data: ${JSON.stringify(job.data)}`,
    );
    const dataSend = job.data;
    await this.mailService.sendResetPasswordMail(dataSend);
    this.logger.log(`Completed job ${job.id}`);
  }

  @Process('sendSSOResetPasswordMail')
  async handleSendSSOResetPasswordMail(job: Job) {
    this.logger.log(
      `Processing job ${job.id} with data: ${JSON.stringify(job.data)}`,
    );
    const dataSend = job.data;
    await this.mailService.sendSSOResetPasswordMail(dataSend);
    this.logger.log(`Completed job ${job.id}`);
  }

  @Process('sendReset2FAMail')
  async handleSendReset2FAMail(job: Job) {
    this.logger.log(
      `Processing job ${job.id} with data: ${JSON.stringify(job.data)}`,
    );
    const dataSend = job.data;
    await this.mailService.sendReset2FAMail(dataSend);
    this.logger.log(`Completed job ${job.id}`);
  }
}
