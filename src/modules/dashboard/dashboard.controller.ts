import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  HttpCode,
  Put,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  @Get('get-statistic')
  getStatisticData(@Req() request: Request) {
    return this.dashboardService.getStatistic(request);
  }
}
