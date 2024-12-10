import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { Log } from './entities/logger.entity';
import { LogController } from './logger.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [LogController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
