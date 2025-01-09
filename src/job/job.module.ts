import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobService } from './job.service';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    BullModule.registerQueue({
      name: 'job',
    }),
  ],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
