import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request } from 'express';

@Controller('csrf')
export class AppController {
  @Get('token')
  getCsrfToken(@Req() request: Request, @Res() response) {
    const csrfToken = request.csrfToken();
    return response.json({ csrfToken });
  }
}
