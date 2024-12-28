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
import * as geoip from 'geoip-lite';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    function maskSensitiveData(body) {
      return Object.keys(body).reduce((acc, key) => {
        if (key.toLowerCase().includes('password')) {
          acc[key] = '***';
        } else {
          acc[key] = body[key];
        }
        return acc;
      }, {});
    }
    const ip =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const geo = geoip.lookup(ip as string);
    const logData = {
      module: request.route?.path || 'Unknown module',
      function_name: request.method,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
      user: request?.user?.data,
      status_code: 200,
      geo_location: geo || { location: 'Unknown location' },
      additional_data: request?.body
        ? { body: maskSensitiveData(request.body) }
        : {},
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
