import { LoggerService } from '@/modules/logger/logger.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnprocessableEntityException,
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
      function_name: request.method,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
      status_code: 200,
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
        if (error instanceof UnprocessableEntityException) {
          logData.status_code = 422;
          this.loggerService.warning('Unprocessable Entity', {
            ...logData,
            responseTime: `${Date.now() - now}ms`,
            stack_trace: error.stack,
          });
        } else {
          this.loggerService.error(error.message, {
            ...logData,
            stack_trace: error.stack,
          });
        }
        throw error;
      }),
    );
  }
}
