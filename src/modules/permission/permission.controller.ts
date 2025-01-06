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
import { Request } from 'express';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Permission Management')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.store(createPermissionDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.permissionService.findAll(request);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
