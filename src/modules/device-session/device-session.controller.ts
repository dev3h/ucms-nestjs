import { Controller, Get, UseGuards } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeviceSessionService } from './device-session.service';
import { DeviceSession } from './entities/device-session.entity';
import LogoutDto from './dto/logout.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserId } from '../user/decorators/user.decorator';

@ApiTags('device-session')
@ApiBearerAuth()
@Controller('device-session')
@UseGuards(JwtAuthGuard)
export class DeviceSessionController {
  constructor(private readonly deviceSessionService: DeviceSessionService) {}

  @Get('')
  async getDeviceSessions(@UserId() userId): Promise<DeviceSession[]> {
    return this.deviceSessionService.getDeviceSessions(userId);
  }

  @Post('logout')
  async logout(@UserId() userId, @Body() body: LogoutDto) {
    const { sessionId } = body;
    return this.deviceSessionService.logout(userId, sessionId);
  }
}
