import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  Req,
  Put,
} from '@nestjs/common';
import { SubsystemService } from './subsystem.service';
import { CreateSubsystemDto } from './dto/create-subsystem.dto';
import { UpdateSubsystemDto } from './dto/update-subsystem.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('SubSystem Management')
@Controller('subsystem')
export class SubsystemController {
  constructor(private readonly subsystemService: SubsystemService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(200)
  create(@Body() createSubsystemDto: CreateSubsystemDto) {
    return this.subsystemService.store(createSubsystemDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.subsystemService.findAll(request);
  }

  @ApiBearerAuth()
  @Get(':id/modules')
  getModules(@Param('id') id: string, @Req() request: Request) {
    return this.subsystemService.getModulesOfSubsystem(+id, request);
  }
  @ApiBearerAuth()
  @Get(':id/rest-modules')
  getRestModules(@Param('id') id: string, @Req() request: Request) {
    return this.subsystemService.getRestModulesOfSubsystem(+id, request);
  }
  @ApiBearerAuth()
  @Post(':id/add-modules')
  addModules(@Param('id') id: string, @Body() modules) {
    return this.subsystemService.addModulesToSubsystem(+id, modules);
  }
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subsystemService.findOne(+id);
  }
  @ApiBearerAuth()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubsystemDto: UpdateSubsystemDto,
  ) {
    return this.subsystemService.update(+id, updateSubsystemDto);
  }
  @ApiBearerAuth()
  @Delete(':id/remove-module/:moduleId')
  removeModule(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.subsystemService.removeModuleFromSubsystem(+id, +moduleId);
  }
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subsystemService.remove(+id);
  }
}
