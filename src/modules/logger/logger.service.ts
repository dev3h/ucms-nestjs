import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/logger.entity';
import { LogLevelEnum } from './enums/log-level.enum';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { ResponseUtil } from '@/utils/response-util';
import { I18nService } from 'nestjs-i18n';
import { LogFilter } from './filters/log.filter';
import { LogDto } from './dto/log.dto';

@Injectable()
export class LoggerService {
  constructor(
    private readonly i18n: I18nService,
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

  async findAll(request: Request) {
    try {
      const query = this.logRepository.createQueryBuilder('log');
      const logFilter = new LogFilter(request);
      logFilter.applyFilters(query);

      query.orderBy('log.created_at', 'DESC');
      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 10;
      const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
      const paginationResult = await paginate(query, page, limit, baseUrl);

      const formattedData = LogDto.mapFromEntities(paginationResult.data);
      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
        meta: paginationResult.meta,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }
}
