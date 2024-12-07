import { format } from 'date-fns';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class Utils {
  static formatDate(date: string): string {
    return format(new Date(date), 'yyyy/MM/dd');
  }

  static formatDateTime(datetime: string): string {
    return format(new Date(datetime), 'yyyy/MM/dd HH:mm');
  }

  static getCurrentUserLogin(context: ExecutionContext): any {
    const request: Request = context.switchToHttp().getRequest();
    return request.user || null;
  }
}
