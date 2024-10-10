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
} from '@nestjs/common';
import { SubsystemService } from './subsystem.service';
import { CreateSubsystemDto } from './dto/create-subsystem.dto';
import { UpdateSubsystemDto } from './dto/update-subsystem.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('SubSystem Management')
@Controller('subsystem')
export class SubsystemController {
  constructor(private readonly subsystemService: SubsystemService) {}

  @Post()
  @HttpCode(200)
  create(@Body() createSubsystemDto: CreateSubsystemDto) {
    return this.subsystemService.create(createSubsystemDto);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.subsystemService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subsystemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubsystemDto: UpdateSubsystemDto,
  ) {
    return this.subsystemService.update(+id, updateSubsystemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subsystemService.remove(+id);
  }
}
