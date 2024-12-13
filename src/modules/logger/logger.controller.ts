import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
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

  @Get('chart-data')
  @ApiQuery({
    name: 'range',
    enum: ['week', 'month', 'year', 'daterange'],
    required: true,
  })
  @ApiQuery({ name: 'start_date', required: false, type: String })
  @ApiQuery({ name: 'end_date', required: false, type: String })
  async getChartData(
    @Query('range') range: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.logService.getChartData(range, startDate, endDate);
  }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.actionService.remove(+id);
  //   }
}