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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Role Management')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() body: CreateRoleDto) {
    return this.roleService.store(body);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.roleService.findAll(request);
  }

  @Get('permission-template')
  async permissionTemplate() {
    return this.roleService.getPermissionTemplate();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.roleService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Get(':id/role-permissions')
  async getPermissionOfRole(@Param('id') id: string, @Req() request: Request) {
    return this.roleService.getPermissionsOfRole(+id);
  }

  @Get(':id/rest-permission')
  async restPermission(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.restPermission(id);
  }
}
