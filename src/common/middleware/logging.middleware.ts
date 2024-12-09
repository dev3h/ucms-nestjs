import { LoggerService } from '@/modules/logger/logger.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip } = req;
    const user_agent = req.get('user-agent') || '';

    this.loggerService.info(`Incoming Request - ${method} ${url}`, {
      ip_Address: ip,
      user_agent,
      module: 'HTTP',
      function_name: 'Middleware',
      additional_data: { headers: req.headers },
    });

    res.on('finish', () => {
      const { statusCode } = res;
      this.loggerService.info(
        `Outgoing Response - ${method} ${url} ${statusCode}`,
        {
          ip_address: ip,
          user_agent,
          module: 'HTTP',
          function_name: 'Middleware',
          status_code: statusCode,
        },
      );
    });

    next();
  }
}
