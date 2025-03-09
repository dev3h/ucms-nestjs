import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { DeviceSessionService } from '../device-session/device-session.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '@/file-upload/file-upload.service';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly deviceSessionService: DeviceSessionService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: new FileUploadService().getMulterOptions('./uploads/avatars')
        .storage,
    }),
  )
  create(@Body() body: CreateUserDto) {
    return this.userService.store(body);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.userService.findAll(request);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(+id, body);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @ApiBearerAuth()
  @Post(':id/reset-2fa')
  @HttpCode(200)
  reset2FA(@Param('id') id: string) {
    return this.userService.reset2FA(+id);
  }

  @ApiBearerAuth()
  @Get(':id/all-permissions')
  getAllPermissions(@Param('id') id: string, @Req() request: Request) {
    return this.userService.getAllPermissionsOfUser(+id, request);
  }

  @ApiBearerAuth()
  @Get(':id/user-permissions')
  getUserPermissions(@Param('id') id: string, @Req() request: Request) {
    return this.userService.getPermissionsOfUser(+id, request);
  }

  @ApiBearerAuth()
  @Get(':id/rest-available-permissions')
  getRestAvailablePermissions(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.userService.getAvailablePermissionsForUser(+id);
  }
  @ApiBearerAuth()
  @Get(':id/rest-permissions')
  getRestPermissions(@Param('id') id: string, @Req() request: Request) {
    return this.userService.getPermissionsForUser(+id);
  }

  @ApiBearerAuth()
  @Get(':id/role-permissions')
  async getPermissionsFromUserRoles(@Param('id') id: string) {
    return await this.userService.getPermissionsFromUserRoles(+id);
  }

  @ApiBearerAuth()
  @Post(':id/add-permissions')
  @HttpCode(200)
  async addPermissionsToUser(@Param('id') userId: number, @Body() body) {
    const permissionIds = body.permissionIds;
    return await this.userService.addPermissionsToUser(userId, permissionIds);
  }

  @ApiBearerAuth()
  @Post(':id/ignore-permissions')
  @HttpCode(200)
  async ignorePermissions(@Param('id') userId: number, @Body() body) {
    const permissionIds = body.permissionIds;
    const removePermissionIgnoreIds = body.removePermissionIgnoreIds;
    return await this.userService.ignorePermissions(
      userId,
      permissionIds,
      removePermissionIgnoreIds,
    );
  }

  @ApiBearerAuth()
  @Post(':id/update-permission')
  @HttpCode(200)
  async updatePermission(@Param('id') userId: number, @Body() body) {
    return await this.userService.updatePermission(userId, body);
  }

  @ApiBearerAuth()
  @Get(':id/device-session')
  async getDeviceSession(@Param('id') userId: number) {
    return await this.userService.getDeviceSessions(userId);
  }

  // @ApiBearerAuth()
  // @Post('import-csv')
  // @UseInterceptors(FileInterceptor('file'))
  // @HttpCode(200)
  // async importCsv(@Req() request: Request) {
  //   return await this.userService.importCsv(request);
  // }

  @ApiBearerAuth()
  @Post(':id/device-session/:deviceId/logout')
  async logoutDeviceSession(
    @Param('id') userId: number,
    @Param('deviceId') deviceId: string,
  ) {
    return this.deviceSessionService.logout(+userId, deviceId);
  }

  @ApiBearerAuth()
  @Post('create-multi')
  @HttpCode(200)
  async createMulti(@Body() body) {
    return await this.userService.createMulti(body);
  }
}
