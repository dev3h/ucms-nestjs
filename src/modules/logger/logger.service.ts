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
import { Utils } from '@/utils/utils';
import { format } from 'date-fns';

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

  async getDateTimeLogs() {
    try {
      const result = await this.logRepository
        .createQueryBuilder('log')
        .select('DISTINCT DATE(log.timestamp)', 'timestamp')
        .orderBy('timestamp', 'DESC')
        .getRawMany();
      const datas = result?.map((item) =>
        format(new Date(item?.timestamp), 'yyyy-MM-dd'),
      );

      return ResponseUtil.sendSuccessResponse({ data: datas });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getChartData(range: string, startDate?: string, endDate?: string) {
    let query = this.logRepository.createQueryBuilder('log');

    // Adjust query range based on input
    switch (range) {
      case 'week':
        query = query.where(
          'log.timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
        );
        break;
      case 'month':
        query = query.where(
          'log.timestamp >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)',
        );
        break;
      case 'year':
        query = query.where(
          'log.timestamp >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)',
        );
        break;
      case 'daterange':
        if (startDate && endDate) {
          query = query.where('log.timestamp BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          });
        } else {
          throw new Error(
            'Start date and end date are required for "daterange".',
          );
        }
        break;
      default:
        throw new Error('Invalid range provided.');
    }

    // Group by either month or date based on range
    if (range === 'year') {
      query = query
        .select('log.level, COUNT(*) as count')
        .addSelect('DATE_FORMAT(log.timestamp, "%Y-%m") as dateGroup')
        .groupBy('log.level, DATE_FORMAT(log.timestamp, "%Y-%m")');
    } else if (range === 'month') {
      query = query
        .select('log.level, COUNT(*) as count')
        .addSelect('DATE_FORMAT(log.timestamp, "%m-%d") as dateGroup')
        .groupBy('log.level, DATE_FORMAT(log.timestamp, "%m-%d")');
    } else if (range === 'week') {
      query = query
        .select('log.level, COUNT(*) as count')
        .addSelect('DATE_FORMAT(log.timestamp, "%a") as dateGroup')
        .groupBy('log.level, DATE_FORMAT(log.timestamp, "%a")');
    } else {
      query = query
        .select('log.level, COUNT(*) as count')
        .addSelect('DATE_FORMAT(log.timestamp, "%Y-%m-%d") as dateGroup')
        .groupBy('log.level, DATE_FORMAT(log.timestamp, "%Y-%m-%d")');
    }

    // Retrieve data
    const logs = await query.orderBy('dateGroup', 'ASC').getRawMany();
    // Format the chart data
    return this.formatChartData(logs, range);
  }

  private formatChartData(logs: any[], range: string) {
    const formattedData = {
      xAxis: [],
      series: {
        debug: [],
        info: [],
        warning: [],
        error: [],
        critical: [],
      },
    };

    // Group data by date
    const groupedByDate = logs.reduce((acc, log) => {
      if (!acc[log.dateGroup]) acc[log.dateGroup] = {};
      acc[log.dateGroup][log.level] = parseInt(log.count, 10);
      return acc;
    }, {});

    // Populate chart data
    for (const [dateGroup, levels] of Object.entries(groupedByDate)) {
      formattedData.xAxis.push(dateGroup);
      formattedData.series.debug.push(levels[LogLevelEnum.DEBUG] || 0);
      formattedData.series.info.push(levels[LogLevelEnum.INFO] || 0);
      formattedData.series.warning.push(levels[LogLevelEnum.WARNING] || 0);
      formattedData.series.error.push(levels[LogLevelEnum.ERROR] || 0);
      formattedData.series.critical.push(levels[LogLevelEnum.CRITICAL] || 0);
    }

    return formattedData;
  }

  async remove(date: string) {
    try {
      await this.logRepository
        .createQueryBuilder()
        .update(Log)
        .set({ deleted_at: new Date() })
        .where('DATE(timestamp) = :date', { date })
        .execute();

      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Deleted-successfully', {
          lang: 'vi',
        }),
      );
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
