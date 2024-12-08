import { LoggerService } from '@/modules/logger/logger.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const logContext = {
      ipAddress: request.ip,
      userAgent: request.get('user-agent') || '',
      module: 'HTTP',
      functionName: 'ExceptionFilter',
      statusCode: status,
      additionalData: { path: request.url, method: request.method },
    };

    // Determine the log level based on the status code or exception type
    if (status >= 500) {
      this.loggerService.critical('Critical Error Occurred', {
        ...logContext,
        stackTrace: (exception as Error).stack,
      });
    } else if (status >= 400) {
      this.loggerService.error('Client Error Occurred', {
        ...logContext,
        stackTrace: (exception as Error).stack,
      });
    } else {
      this.loggerService.warning('Warning: Unexpected Issue', logContext);
    }

    // Send a response back to the client
    response.status(status).json({
      statusCode: status,
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error',
    });
  }
}
