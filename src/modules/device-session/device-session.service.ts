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
import { I18nService } from 'nestjs-i18n';
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
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(DeviceSession)
    private deviceSessionRepository: Repository<DeviceSession>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  generateSecretKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  async logout(userId: number, deviceId: string) {
    const deviceSession: any = await this.deviceSessionRepository
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
    await this.deviceSessionRepository.delete(deviceSession?.id);
    return ResponseUtil.sendSuccessResponse(
      null,
      this.i18n.t('message.logout-successfully', {
        lang: 'vi',
      }),
    );
  }

  async reAuth(deviceId: string, _refreshToken: string) {
    const deviceSession: any = await this.deviceSessionRepository
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

    const uid = Buffer.from(deviceSession.user.id.toString()).toString(
      'base64',
    );

    await this.deviceSessionRepository.update(deviceSession.id, {
      secret_key: secretKey,
      refresh_token: refreshToken,
      expired_at: expiredAt,
    });
    const dataRes = {
      access_token: token,
      refresh_token: refreshToken,
      expired_at: expiredAt,
      uid,
    };

    return ResponseUtil.sendSuccessResponse({ ...dataRes });
  }

  async handleDeviceSession(
    userId,
    metaData,
    system = null,
  ): Promise<LoginRespionse> {
    const { deviceId } = metaData;
    const currentDevice = await this.deviceSessionRepository.findOne({
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
    if (currentDevice && currentDevice.user === userId) {
      deviceSession = currentDevice;
    } else {
      deviceSession = new DeviceSession();
    }

    const device = this.detectOSFamily(metaData.os);
    const sessionData = {
      user: userId,
      secret_key: secretKey,
      refresh_token: refreshToken,
      expired_at: expiredAt,
      device_id: deviceId,
      ip_address: metaData.ipAddress,
      ua: metaData.ua,
      name: deviceName,
      os: metaData.os,
      browser: metaData.browser,
      device_type: device,
      session_type: system ? 2 : undefined,
    };

    Object.assign(deviceSession, sessionData);

    // update or create device session
    await this.deviceSessionRepository.save(deviceSession);
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
    return this.deviceSessionRepository.find({
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
