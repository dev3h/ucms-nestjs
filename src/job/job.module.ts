import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobService } from './job.service';
import { UserModule } from '../modules/user/user.module';
import { JobProcessor } from './job.processor';

@Module({
  imports: [
    forwardRef(() => UserModule),
    BullModule.registerQueue({
      name: 'job-custom',
    }),
  ],
  providers: [JobService, JobProcessor],
  exports: [JobService],
})
export class JobModule {}
