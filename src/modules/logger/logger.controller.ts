import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { LoggerService } from './logger.service';

@ApiTags('Log Management')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LoggerService) {}

  @Get()
  findAll(@Req() request: Request) {
    return this.logService.findAll(request);
  }

  @Get('date-times-logs')
  getDateTimeLogs() {
    return this.logService.getDateTimeLogs();
  }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.actionService.remove(+id);
  //   }
}
