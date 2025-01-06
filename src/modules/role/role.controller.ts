import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  Put,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Role Management')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() body: CreateRoleDto) {
    return this.roleService.store(body);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.roleService.findAll(request);
  }

  @ApiBearerAuth()
  @Get('permission-template')
  async permissionTemplate() {
    return this.roleService.getPermissionTemplate();
  }
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.roleService.update(+id, body);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @ApiBearerAuth()
  @Get(':id/role-permissions')
  async getPermissionOfRole(@Param('id') id: string, @Req() request: Request) {
    return this.roleService.getPermissionsOfRole(+id);
  }

  @ApiBearerAuth()
  @Get(':id/rest-permission')
  async restPermission(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.restPermission(id);
  }
}
