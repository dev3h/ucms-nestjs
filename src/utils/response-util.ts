import { HttpException, HttpStatus } from '@nestjs/common';

export class ResponseUtil {
  static sendSuccessResponse(
    data: any,
    message: string = '',
    code: number = HttpStatus.OK,
  ) {
    return {
      status_code: code,
      message: message,
      ...data,
    };
  }

  static sendErrorResponse(
    message: string,
    errors: any = null,
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    throw new HttpException(
      {
        status_code: code,
        message: message,
        errors: errors,
      },
      code,
    );
  }
}
