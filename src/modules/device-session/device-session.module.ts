import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSessionController } from './device-session.controller';
import { DeviceSession } from './entities/device-session.entity';
import { DeviceSessionService } from './device-session.service';
import { AuthModule } from '../auth/login/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceSession]),
    forwardRef(() => AuthModule),
  ],
  controllers: [DeviceSessionController],
  providers: [DeviceSessionService],
  exports: [DeviceSessionService, TypeOrmModule],
})
export class DeviceSessionModule {}
