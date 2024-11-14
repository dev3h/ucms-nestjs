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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Module Management')
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @HttpCode(200)
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.store(createModuleDto);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.moduleService.findAll(request);
  }

  @Get(':id/actions')
  getActions(@Param('id') id: string, @Req() request: Request) {
    return this.moduleService.getActionsOfModule(+id, request);
  }
  @Get(':id/rest-actions')
  getRestActions(@Param('id') id: string, @Req() request: Request) {
    return this.moduleService.getRestActionsOfModule(+id, request);
  }
  @Post(':id/add-actions')
  addActions(@Param('id') id: string, @Body() actions) {
    return this.moduleService.addActionsToModule(+id, actions);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    return this.moduleService.update(+id, body);
  }
  @Delete(':id/remove-action/:actionId')
  removeAction(@Param('id') id: string, @Param('actionId') actionId: string) {
    return this.moduleService.removeActionFromModule(+id, +actionId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }
}
