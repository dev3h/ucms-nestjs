import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { UserLoginHistoryService } from './user-login-history.service';

@Controller('user-login-history')
export class UserLoginHistoryController {
  constructor(private readonly loginHistoryService: UserLoginHistoryService) {}

  // API để lưu lịch sử đăng nhập
  @Post('record-login')
  async recordLogin(@Body() data) {
    return await this.loginHistoryService.recordLogin(data);
  }

  // API để lấy lịch sử đăng nhập theo device_id
  @Get('history/:deviceId')
  async getLoginHistory(@Param('deviceId') deviceId: string) {
    return await this.loginHistoryService.getLoginHistory(deviceId);
  }

  // API để tự động đăng nhập từ lịch sử
  @Post('auto-login')
  async autoLoginFromHistory(@Body() data) {
    return await this.loginHistoryService.autoLoginFromHistory(data);
  }

  @Get('generate-device-id')
  async generateDeviceId(@Res() res) {
    return await this.loginHistoryService.generateDeviceId(res);
  }
}
