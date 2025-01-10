import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { JobService } from './job.service';

@Processor('job-custom')
export class JobProcessor {
  private readonly logger = new Logger(JobProcessor.name);
  constructor(private readonly jobService: JobService) {}

  @Process('handleImportUsers')
  async importUsers(job: Job) {
    this.logger.log(`Processing job ${job.id}}`);
    const dataSend = job.data;
    await this.jobService.handleImportUsers(dataSend);
    this.logger.log(`Completed job ${job.id}`);
  }
}
