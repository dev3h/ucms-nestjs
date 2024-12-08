import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { Log } from './entities/logger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LoggerService],
  exports: [LoggerService], // Export if needed in other modules
})
export class LoggerModule {}
