import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

export class LanguageCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers['lang']) {
      req.headers['lang'] = 'vi';
    }
    next();
  }
}
