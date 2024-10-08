import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginHistory } from './user-login-history.entity';
import { UserLoginHistoryController } from './user-login-history.controller';
import { UserLoginHistoryService } from './user-login-history.service';
import { System } from '../system/entities/system.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLoginHistory, System])],
  controllers: [UserLoginHistoryController],
  providers: [UserLoginHistoryService],
  exports: [UserLoginHistoryService],
})
export class UserLoginHistoryModule {}
