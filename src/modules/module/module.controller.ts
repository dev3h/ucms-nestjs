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
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Module Management')
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(200)
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.store(createModuleDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.moduleService.findAll(request);
  }

  @ApiBearerAuth()
  @Get(':id/actions')
  getActions(@Param('id') id: string, @Req() request: Request) {
    return this.moduleService.getActionsOfModule(+id, request);
  }
  @ApiBearerAuth()
  @Get(':id/rest-actions')
  getRestActions(@Param('id') id: string, @Req() request: Request) {
    return this.moduleService.getRestActionsOfModule(+id, request);
  }
  @ApiBearerAuth()
  @Post(':id/add-actions')
  addActions(@Param('id') id: string, @Body() actions) {
    return this.moduleService.addActionsToModule(+id, actions);
  }
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    return this.moduleService.update(+id, body);
  }
  @ApiBearerAuth()
  @Delete(':id/remove-action/:actionId')
  removeAction(@Param('id') id: string, @Param('actionId') actionId: string) {
    return this.moduleService.removeActionFromModule(+id, +actionId);
  }
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }
}
