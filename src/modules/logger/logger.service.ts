import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/logger.entity';
import { LogLevelEnum } from './enums/log-level.enum';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  private async log(
    level: LogLevelEnum,
    message: string,
    context: Partial<{
      userId: number;
      module: string;
      functionName: string;
      statusCode: number;
      ipAddress: string;
      userAgent: string;
      stackTrace: string;
      additionalData: object;
    }> = {},
  ): Promise<void> {
    const data = {
      level,
      message,
      timestamp: new Date(),
      ...context,
    };
    const logEntry = this.logRepository.create(data);
    await this.logRepository.save(logEntry);
  }

  async debug(message: string, context?: Record<string, any>) {
    await this.log(LogLevelEnum.DEBUG, message, context);
  }

  async info(message: string, context?: Record<string, any>) {
    await this.log(LogLevelEnum.INFO, message, context);
  }

  async warning(message: string, context?: Record<string, any>) {
    await this.log(LogLevelEnum.WARNING, message, context);
  }

  async error(message: string, context?: Record<string, any>) {
    await this.log(LogLevelEnum.ERROR, message, context);
  }

  async critical(message: string, context?: Record<string, any>) {
    await this.log(LogLevelEnum.CRITICAL, message, context);
  }
}
