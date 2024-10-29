import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    return this.moduleService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }
}
