import { LoggerService } from '@/modules/logger/logger.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as geoip from 'geoip-lite';

@Injectable()
@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  async getClientIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'Unknown IP';
    } catch (error) {
      console.error('Failed to fetch public IP:', error.message);
      return 'Unknown IP';
    }
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const localIp =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    const publicIp = await this.getClientIp();
    const ip = publicIp || localIp;
    const geo = geoip.lookup(ip);
    const logContext = {
      ip_address: ip,
      user_agent: request.get('user-agent') || '',
      module: host.getType() || 'HTTP',
      function_name: 'ExceptionFilter',
      status_code: status,
      geo_location: geo || { location: 'Unknown location' },
      additional_data: { path: request.url, method: request.method },
    };

    // Determine the log level based on the status code or exception type
    if (status >= 500) {
      this.loggerService.critical(
        `Critical Error Occurred: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        {
          ...logContext,
          stack_trace:
            exception instanceof Error
              ? exception.stack
              : 'No stack trace available',
        },
      );
    } else if (status >= 400) {
      this.loggerService.error(
        `Client Error Occurred: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        {
          ...logContext,
          stack_trace:
            exception instanceof Error
              ? exception.stack
              : 'No stack trace available',
        },
      );
    } else {
      this.loggerService.warning('Warning: Unexpected Issue', logContext);
    }

    if (!response.headersSent) {
      response.status(status).json(
        exception instanceof HttpException ||
          exception instanceof UnprocessableEntityException
          ? exception.getResponse()
          : {
              status_code: status,
              message: 'Đã xảy ra lỗi vui lòng thử lại sau',
              errors: [(exception as Error).stack],
            },
      );
    }
  }
}
