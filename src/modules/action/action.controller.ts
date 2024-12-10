import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Put,
} from '@nestjs/common';
import { ActionService } from './action.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Action Management')
@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post()
  create(@Body() createActionDto: CreateActionDto) {
    return this.actionService.store(createActionDto);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.actionService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actionService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateActionDto: UpdateActionDto) {
    return this.actionService.update(+id, updateActionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actionService.remove(+id);
  }
}
