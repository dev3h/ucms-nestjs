import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { Log } from './entities/logger.entity';
import { LogFilter } from './filters/log.filter';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [
    LoggerService,
    {
      provide: LogFilter,
      useClass: LogFilter,
      scope: Scope.REQUEST,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
