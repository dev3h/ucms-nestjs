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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SETTINGS } from 'src/app.utils';

import { UserRegisterRequestDto } from './dto/user-register.req.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { DeviceSessionService } from '../device-session/device-session.service';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly deviceSessionService: DeviceSessionService,
  ) {}

  @Post('/register')
  @ApiCreatedResponse({
    description: 'Created user object as response',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'User cannot register. Try again!' })
  async doUserRegistration(
    @Body(SETTINGS.VALIDATION_PIPE)
    userRegister: UserRegisterRequestDto,
  ): Promise<User> {
    return await this.userService.doUserRegistration(userRegister);
  }

  @Post()
  @HttpCode(200)
  create(@Body() body: CreateUserDto) {
    return this.userService.store(body);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.userService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get(':id/all-permissions')
  getAllPermissions(@Param('id') id: string, @Req() request: Request) {
    return this.userService.getAllPermissionsOfUser(+id, request);
  }

  @Get(':id/user-permissions')
  getUserPermissions(@Param('id') id: string, @Req() request: Request) {
    return this.userService.getPermissionsOfUser(+id, request);
  }

  @Get(':id/rest-available-permissions')
  getRestAvailablePermissions(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.userService.getAvailablePermissionsForUser(+id);
  }
  @Get(':id/rest-permissions')
  getRestPermissions(@Param('id') id: string, @Req() request: Request) {
    return this.userService.getPermissionsForUser(+id);
  }

  @Get(':id/role-permissions')
  async getPermissionsFromUserRoles(@Param('id') id: string) {
    return await this.userService.getPermissionsFromUserRoles(+id);
  }

  @Post(':id/add-permissions')
  @HttpCode(200)
  async addPermissionsToUser(@Param('id') userId: number, @Body() body) {
    const permissionIds = body.permissionIds;
    return await this.userService.addPermissionsToUser(userId, permissionIds);
  }

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

  @Post(':id/update-permission')
  @HttpCode(200)
  async updatePermission(@Param('id') userId: number, @Body() body) {
    return await this.userService.updatePermission(userId, body);
  }

  @Get(':id/device-session')
  async getDeviceSession(@Param('id') userId: number) {
    return await this.userService.getDeviceSessions(userId);
  }

  @Post(':id/device-session/:deviceId/logout')
  async logoutDeviceSession(
    @Param('id') userId: number,
    @Param('deviceId') deviceId: string,
  ) {
    return this.deviceSessionService.logout(+userId, deviceId);
  }
}
