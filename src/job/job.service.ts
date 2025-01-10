import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ResponseUtil } from '@/utils/response-util';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectQueue('job-custom') private readonly jobQueue: Queue,
  ) {}

  async handleImportUsers(data: any) {
    try {
      await this.userService.createDirectly(data);
    } catch (error) {
      this.logger.error(`Failed to import users`, error.stack);
      return ResponseUtil.sendErrorResponse('Failed to import users', error);
    }
  }

  async addHandleImportUsersJob(data: any) {
    this.logger.log(`Adding job to import users`);
    await this.jobQueue.add('handleImportUsers', data);
  }
}
