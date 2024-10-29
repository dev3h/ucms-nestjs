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
import { SystemService } from './system.service';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('System Management')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Post()
  @HttpCode(200)
  create(@Body() body: CreateSystemDto) {
    return this.systemService.store(body);
  }

  @Post('check-data-system')
  @HttpCode(200)
  checkCorrectSystem(@Body() body) {
    return this.systemService.checkClientIdAndRedirectUri(body);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.systemService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateSystemDto) {
    return this.systemService.update(+id, body);
  }

  @Post(':id/create-new-client-secret')
  @HttpCode(200)
  storeClientSecret(@Param('id') id: string) {
    return this.systemService.storeClientSecret(+id);
  }

  @Put(':id/update-client-secret/:clientSecretId')
  @HttpCode(200)
  updateClientSecret(
    @Param('id') id: string,
    @Param('clientSecretId') clientSecretId: string,
  ) {
    return this.systemService.updateClientSecret(+id, +clientSecretId);
  }

  @Delete(':id/delete-client-secret/:clientSecretId')
  @HttpCode(200)
  deleteClientSecret(
    @Param('id') id: string,
    @Param('clientSecretId') clientSecretId: string,
  ) {
    return this.systemService.deleteClientSecret(+id, +clientSecretId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemService.remove(+id);
  }
}
