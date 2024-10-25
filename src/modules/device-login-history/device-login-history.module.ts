import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceLoginHistory } from './entities/device-login-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceLoginHistory])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class DeviceLoginHistoryModule {}
