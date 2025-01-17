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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('System Management')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(200)
  create(@Body() body: CreateSystemDto) {
    return this.systemService.store(body);
  }

  @ApiBearerAuth()
  @Post('check-data-system')
  @HttpCode(200)
  checkCorrectSystem(@Body() body) {
    return this.systemService.checkClientIdAndRedirectUri(body);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.systemService.findAll(request);
  }
  @ApiBearerAuth()
  @Get(':id/subsystems')
  getSubsystems(@Param('id') id: string, @Req() request: Request) {
    return this.systemService.getSubsystemsOfSystem(+id, request);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemService.findOne(+id);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateSystemDto) {
    return this.systemService.update(+id, body);
  }

  @ApiBearerAuth()
  @Post(':id/create-new-client-secret')
  @HttpCode(200)
  storeClientSecret(@Param('id') id: string) {
    return this.systemService.storeClientSecret(+id);
  }

  @ApiBearerAuth()
  @Put(':id/update-client-secret/:clientSecretId')
  @HttpCode(200)
  updateClientSecret(
    @Param('id') id: string,
    @Param('clientSecretId') clientSecretId: string,
  ) {
    return this.systemService.updateClientSecret(+id, +clientSecretId);
  }

  @ApiBearerAuth()
  @Delete(':id/delete-client-secret/:clientSecretId')
  @HttpCode(200)
  deleteClientSecret(
    @Param('id') id: string,
    @Param('clientSecretId') clientSecretId: string,
  ) {
    return this.systemService.deleteClientSecret(+id, +clientSecretId);
  }

  @ApiBearerAuth()
  @Delete(':id/remove-subsystem/:subsystemId')
  removeModule(
    @Param('id') id: string,
    @Param('subsystemId') subsystemId: string,
  ) {
    return this.systemService.removeSubsystemFromSystem(+id, +subsystemId);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemService.remove(+id);
  }
}
