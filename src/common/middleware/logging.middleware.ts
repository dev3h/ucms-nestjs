import { LoggerService } from '@/modules/logger/logger.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || '';

    this.loggerService.info(`Incoming Request - ${method} ${url}`, {
      ipAddress: ip,
      userAgent,
      module: 'HTTP',
      functionName: 'Middleware',
      additionalData: { headers: req.headers },
    });

    res.on('finish', () => {
      const { statusCode } = res;
      this.loggerService.info(
        `Outgoing Response - ${method} ${url} ${statusCode}`,
        {
          ipAddress: ip,
          userAgent,
          module: 'HTTP',
          functionName: 'Middleware',
          statusCode,
        },
      );
    });

    next();
  }
}
