import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';

import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import addDay from '@/helpers/addDay';
import { DeviceSession } from './entities/device-session.entity';
import { AuthService } from '../auth/login/auth.service';
import { JwtStrategy } from '../auth/guard/jwt.strategy';
import { DeviceTypeEnum } from './enums/device-type.enum';
import { ResponseUtil } from '@/utils/response-util';
const EXP_SESSION = 7; // 1 week
export interface LoginRespionse {
  token: string;
  refreshToken: string;
  expiredAt: Date;
  deviceId?: string;
}
@ApiBearerAuth()
@Injectable()
export class DeviceSessionService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(DeviceSession)
    private repository: Repository<DeviceSession>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  generateSecretKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  async logout(userId: number, deviceId: string) {
    const deviceSession: any = await this.repository
      .createQueryBuilder('deviceSession')
      .leftJoinAndSelect('deviceSession.user', 'user')
      .select(['deviceSession', 'user.id'])
      .where('deviceSession.device_id = :deviceId', { deviceId })
      .getOne();

    if (!deviceSession || deviceSession.user.id !== userId) {
      throw new ForbiddenException();
    }
    const keyCache = this.authService.getKeyCache(
      userId,
      deviceSession.device_id,
    );

    await this.cacheManager.set(keyCache, null);
    await this.repository.delete(deviceSession?.id);
    return {
      message: 'Logout success',
      status: 200,
    };
  }

  async reAuth(deviceId: string, _refreshToken: string) {
    const deviceSession: any = await this.repository
      .createQueryBuilder('deviceSession')
      .select('deviceSession', 'user.id')
      .leftJoinAndSelect('deviceSession.user', 'user')
      .where('deviceSession.refresh_token = :_refreshToken', { _refreshToken })
      .andWhere('deviceSession.device_id = :deviceId', { deviceId })
      .getOne();

    if (
      !deviceSession ||
      new Date(deviceSession.expired_at).valueOf() < new Date().valueOf()
    ) {
      return ResponseUtil.sendErrorResponse(
        'Unauthorized',
        'INVALID_REFRESH_TOKEN',
        401,
      );
    }

    const payload = {
      id: deviceSession.user.id,
      deviceId,
    };

    const secretKey = this.generateSecretKey();
    const [token, refreshToken, expiredAt] = [
      JwtStrategy.generate(payload, secretKey),
      crypto.randomBytes(30).toString('hex'),
      addDay(7),
    ];

    await this.repository.update(deviceSession.id, {
      secret_key: secretKey,
      refresh_token: refreshToken,
      expired_at: expiredAt,
    });
    const dataRes = {
      access_token: token,
      refresh_token: refreshToken,
      expired_at: expiredAt,
    };

    return ResponseUtil.sendSuccessResponse({ ...dataRes });
  }

  async handleDeviceSession(userId, metaData): Promise<LoginRespionse> {
    const { deviceId } = metaData;
    const currentDevice = await this.repository.findOne({
      where: { device_id: deviceId },
    });

    const expiredAt = addDay(EXP_SESSION);
    const secretKey = this.generateSecretKey();

    const payload = {
      id: userId,
      deviceId,
    };
    const [token, refreshToken] = [
      JwtStrategy.generate(payload, secretKey),
      crypto.randomBytes(64).toString('hex'),
    ];

    const deviceName = metaData.deviceId;
    let deviceSession;
    if (currentDevice) {
      deviceSession = currentDevice;
    } else {
      deviceSession = new DeviceSession();
    }
    deviceSession.user = userId;
    deviceSession.secret_key = secretKey;
    deviceSession.refresh_token = refreshToken;
    deviceSession.expired_at = expiredAt;
    deviceSession.device_id = deviceId;
    deviceSession.ip_address = metaData.ipAddress;
    deviceSession.ua = metaData.ua;
    deviceSession.name = deviceName;
    deviceSession.os = metaData.os;
    deviceSession.browser = metaData.browser;
    const device = this.detectOSFamily(metaData.os);
    deviceSession.device_type = device;
    // update or create device session
    await this.repository.save(deviceSession);
    return { token, refreshToken, expiredAt, deviceId: deviceName };
  }

  public detectOSFamily(osFamily: string): number {
    const desktopOS = ['windows', 'macos', 'macintosh', 'linux', 'chrome os'];
    const mobileOS = ['ios', 'android', 'kaios'];

    const osFamilyLower = osFamily.toLowerCase();

    if (desktopOS.includes(osFamilyLower)) return DeviceTypeEnum.DESKTOP;
    if (mobileOS.includes(osFamilyLower)) return DeviceTypeEnum.MOBILE;
    return DeviceTypeEnum.UNKNOWN;
  }

  async getDeviceSessions(userId) {
    return this.repository.find({
      where: {
        user: userId,
      },
      select: [
        'id',
        'device_id',
        'created_at',
        'ip_address',
        'name',
        'ua',
        'expired_at',
        'updated_at',
      ],
    });
  }
}
