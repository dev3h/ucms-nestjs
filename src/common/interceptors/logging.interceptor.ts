import { LoggerService } from '@/modules/logger/logger.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const logData = {
      module: request.route?.path || 'Unknown module',
      functionName: request.method,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };

    const now = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.loggerService.info('Request successfully processed', {
          ...logData,
          responseTime: `${Date.now() - now}ms`,
        }),
      ),
      catchError((error) => {
        this.loggerService.error(error.message, {
          ...logData,
          stackTrace: error.stack,
        });
        throw error;
      }),
    );
  }
}
