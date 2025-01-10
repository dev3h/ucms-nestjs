import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { JobService } from './job.service';
import { UserModule } from '../modules/user/user.module';
import { JobProcessor } from './job.processor';
import { Queue } from 'bull';

@Module({
  imports: [
    forwardRef(() => UserModule),
    BullModule.registerQueue({
      name: 'job-custom',
    }),
  ],
  providers: [JobService, JobProcessor],
  exports: [JobService, BullModule],
})
export class JobModule implements OnModuleInit {
  constructor(@InjectQueue('job-custom') private readonly jobQueue: Queue) {}

  onModuleInit() {
    console.log('Job queue initialized:', !!this.jobQueue);
  }
}
