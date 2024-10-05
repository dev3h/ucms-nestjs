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
}
