import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import * as bcrypt from 'bcrypt';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { ResponseUtil } from '@/utils/response-util';
import { InjectRepository } from '@nestjs/typeorm';
import { System } from '@/modules/system/entities/system.entity';
import { DataSource, Repository } from 'typeorm';
import { SystemToken } from '@/modules/system-token/entities/system-token.entity';
import { User } from '@/modules/user/user.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import TokenPayload from '../tokenPayload.interface';
import { RedisService } from '@/modules/redis/redis.service';
import { SystemService } from '../../system/system.service';
import { UserPermissionStatusEnum } from '@/modules/user/enums/user-permission-status.enum';
import { UserLoginHistoryService } from '@/modules/user-login-history/user-login-history.service';
import { SystemClientSecret } from '@/modules/system-client-secret/entities/system-client-secret.entity';
import { DeviceLoginHistory } from '@/modules/device-login-history/entities/device-login-history.entity';
import { DeviceLoginHistoryDto } from '@/modules/device-login-history/dto/device-login-history.dto';
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';
import { Module } from '@/modules/module/entities/module.entity';
import { Action } from '@/modules/action/entities/action.entity';
import { UserTypeEnum } from '@/modules/user/enums/user-type.enum';
import { DeviceSessionService } from '@/modules/device-session/device-session.service';
import { DeviceSession } from '@/modules/device-session/entities/device-session.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtStrategy } from '../guard/jwt.strategy';
import { Cache } from 'cache-manager';
import { DeviceSessionDto } from '../dto/device-session.dto';

export interface JwtPayload {
  id: string;
  deviceId: string;
  exp: number;
}
@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    private userService: UserService,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    private readonly systemService: SystemService,
    @InjectRepository(Subsystem)
    private readonly subsystemRepository: Repository<Subsystem>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SystemToken)
    private readonly systemTokenRepository: Repository<SystemToken>,
    @InjectRepository(SystemClientSecret)
    private readonly systemClientSecretRepository: Repository<SystemClientSecret>,
    @InjectRepository(DeviceLoginHistory)
    private readonly deviceLoginHistoryRepository: Repository<DeviceLoginHistory>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly userLoginHistoryService: UserLoginHistoryService,
    @Inject(forwardRef(() => DeviceSessionService))
    private deviceSessionService: DeviceSessionService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(DeviceSession)
    private deviceSessionRepository: Repository<DeviceSession>,
  ) {}

  // Tạo admin token
  async createAdminToken(admin: any) {
    const payload = { email: admin.email, id: admin.id };
    const expiresIn = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      '10m',
    );
    const token = this.jwtService.sign(payload, { expiresIn });

    await this.redisService.saveSession(
      `admin-session:${admin.id}`,
      token,
      18000,
    );
    return token;
  }
  async createRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email, type: user.type };
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      '7d',
    );
    return this.jwtService.sign(payload, { expiresIn });
  }
  async verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        err?.message,
      );
    }
  }
  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    await this.userRepository.update(userId, {
      refresh_token: refreshToken,
    });
  }
  async updateLastLoginAtAndResetBlock(userId: number) {
    await this.userRepository.update(userId, {
      last_login_at: new Date(),
      failed_login_count: 0,
      is_blocked: false,
      blocked_at: null,
    });
  }

  // Tạo user token
  async createUserToken(user: any) {
    const payload = { email: user.email, id: user.id, role: 'user' };
    const token = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    await this.redisService.saveSession(`user-session:${user.id}`, token, 3600);
    return token;
  }

  // Xác thực token từ Redis, kiểm tra nếu bị blacklist
  async verifyToken(data) {
    try {
      const { token, deviceId, sessionType = 1, uid = null } = data;
      const isBlacklisted = await this.redisService?.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.invalid-token', {
            lang: 'vi',
          }),
        );
      }
      let userId = null;
      if (uid) {
        userId = Buffer.from(uid, 'base64').toString('utf-8');
      }
      const deviceSession = await this.deviceSessionRepository.findOne({
        where: {
          device_id: deviceId,
          session_type: sessionType,
          user: { id: Number(userId) },
        },
      });
      if (!deviceSession) {
        throw new JsonWebTokenError(
          this.i18n.t('message.invalid-device', { lang: 'vi' }),
        );
      }

      const payload = this.jwtService.verify(token, {
        secret: deviceSession.secret_key,
      });
      return payload;
    } catch (e) {
      if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          this.i18n.t('message.invalid-token', {
            lang: 'vi',
          }),
        );
      }
      return ResponseUtil.sendErrorResponse(
        this.i18n?.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        e.message,
      );
    }
  }

  async verifyTokenAuth(token: string, deviceId: string) {
    const isBlacklisted = await this.redisService?.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-token', {
          lang: 'vi',
        }),
      );
    }

    const deviceSession = await this.deviceSessionRepository.findOne({
      where: { device_id: deviceId },
    });
    if (!deviceSession) {
      throw new JsonWebTokenError(
        this.i18n.t('message.invalid-device', { lang: 'vi' }),
      );
    }

    const payload = this.jwtService.verify(token, {
      secret: deviceSession.secret_key,
    });
    return payload;
  }

  // Blacklist token khi user/admin logout
  async logout(token: string) {
    await this.redisService.blacklistToken(token);
  }

  // Tạo session với JWT
  createSession(user: any): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload); // Trả về JWT làm session
  }

  // Xác thực session
  verifySession(token: string) {
    try {
      return this.jwtService.verify(token); // Xác thực token
    } catch (e) {
      throw new Error('Invalid session token');
    }
  }

  // Tạo consent token sau khi người dùng nhập đúng mật khẩu
  createConsentToken(user: any): string {
    const payload = { email: user.email, id: user.id }; // payload chứa email và id người dùng

    // Tạo token JWT với thời gian hết hạn là 1h
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  // Xác thực consent token khi người dùng đồng ý quyền
  verifyConsentToken(token: string): any {
    return this.jwtService.verify(token);
  }

  async validateUserCreds(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new UnprocessableEntityException({
        errors: {
          email: [
            this.i18n.t('message.email.not-found', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('message.email.not-found', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
    if (user.failed_login_count >= 5) {
      const fiveMinutesInMilliseconds = 5 * 60 * 1000;
      const unblockTime = new Date(
        user.blocked_at.getTime() + fiveMinutesInMilliseconds,
      );
      const remainingTime = Math.floor(
        (unblockTime.getTime() - new Date().getTime()) / 1000,
      );

      if (remainingTime > 0) {
        return ResponseUtil.sendErrorResponse(
          String(remainingTime),
          'USER_IS_BLOCKED',
        );
      } else {
        // Reset the block status if the block time has passed
        user.blocked_at = null;
        user.is_blocked = false;
        user.failed_login_count = 0;
        await user.save();
      }
    }

    if (!(await bcrypt.compare(password, user.password))) {
      user.failed_login_count += 1;
      await user.save();
      if (user.failed_login_count >= 5) {
        user.is_blocked = true;
        user.blocked_at = new Date();
        await user.save();
      }
      throw new UnprocessableEntityException({
        errors: {
          password: [
            this.i18n.t('auth.password', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('auth.password', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    return user;
  }

  async adminLogin(data, metaData) {
    const admin = await this.validateUserCreds(data.email, data.password);
    if (admin.type !== UserTypeEnum.ADMIN) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.not-admin-account'),
        'NOT_ADMIN_ACCOUNT',
      );
    }

    const passwordExpiryMonths = parseInt(
      this.configService.get<string>('PASSWORD_EXPIRY_MONTHS', '3'),
      10,
    );
    const passwordExpiryDate = new Date(admin.password_updated_at);
    passwordExpiryDate.setMonth(
      passwordExpiryDate.getMonth() + passwordExpiryMonths,
    );

    if (new Date() > passwordExpiryDate) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('auth.password-expired'),
        'PASSWORD_EXPIRED',
      );
    }

    // const accessToken = await this.createAdminToken(admin);
    // const refreshToken = await this.createRefreshToken(admin);
    // await this.setCurrentRefreshToken(refreshToken, admin.id);
    await this.updateLastLoginAtAndResetBlock(admin.id);
    const deviceSession = await this.deviceSessionService.handleDeviceSession(
      admin.id,
      metaData,
    );
    const uid = Buffer.from(admin.id.toString()).toString('base64');
    const dataRes = {
      access_token: `${deviceSession.token}`,
      refresh_token: deviceSession.refreshToken,
      expired_at: deviceSession.expiredAt,
      uid,
    };

    return ResponseUtil.sendSuccessResponse({ ...dataRes });
  }

  async generateToken(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createAuthTempCode(user: User): Promise<string> {
    const payload = { id: user?.id, email: user?.email };
    const authTempCode = this.jwtService.sign(payload, { expiresIn: '10m' }); // Mã xác thực tạm thời có thời hạn 3 phút
    return authTempCode;
  }

  async verifyAuthTempCode(authTempCode: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(authTempCode);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired auth code');
    }
  }

  // async createFinalToken(user: any, filteredPermissions) {
  //   const payload = {
  //     email: user?.email,
  //     id: user?.id,
  //     permissions: filteredPermissions,
  //   };
  //   const token = this.jwtService.sign(payload, {
  //     expiresIn: '15h',
  //   });

  //   await this.redisService.saveSession(`user-session:${user.id}`, token, 3600);
  //   return token;
  // }
  private async createFinalToken(user: User) {
    const payload = {
      email: user?.email,
      id: user.id,
    };
    return this.jwtService.sign(payload);
  }

  // Lấy thông tin user từ final token
  verifyFinalToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        err?.message,
      );
    }
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async checkClientIdAndRedirectUri(data: any) {
    const system = await this.systemRepository.findOne({
      where: { client_id: data.client_id },
    });

    if (!system) {
      const errorMessage = encodeURIComponent(
        this.i18n.t('message.Invalid-client_id', {
          lang: 'vi',
        }),
      );
      return ResponseUtil.sendErrorResponse(errorMessage, 'INVALID_CLIENT_ID');
    }

    const isValidRedirectUri = system.redirect_uris.includes(data.redirect_uri);
    if (!isValidRedirectUri) {
      const errorMessage = encodeURIComponent(
        this.i18n.t('message.Invalid-redirect_uri', {
          lang: 'vi',
        }),
      );
      return ResponseUtil.sendErrorResponse(
        errorMessage,
        'INVALID_REDIRECT_URI',
      );
    }

    return ResponseUtil.sendSuccessResponse({ data: system });
  }

  async checkEmailExist(email: string, query: any) {
    await this.checkClientIdAndRedirectUri(query);
    const user = await this.userRepository.findOne({
      where: {
        email,
        type: UserTypeEnum.USER,
      },
    });
    if (!user) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Account-not-valid', {
          lang: 'vi',
        }),
        'NOT_FOUND',
      );
    }
    const sessionToken = this.createSession(user);
    return ResponseUtil.sendSuccessResponse({
      data: {
        sessionToken,
        email,
        ...query,
      },
    });
  }

  async loginWithUCSM(data: any, query) {
    const system = await this.checkClientIdAndRedirectUri(query);
    if (system?.data === null) {
      return ResponseUtil.sendErrorResponseWithNoException(
        'Invalid client_id or redirect_uri',
        'INVALID_CLIENT_ID_OR_REDIRECT_URI',
      );
    }
    const dataSession = this.verifySession(query?.session_token);
    const isValidEmail = await this.userRepository.findOne({
      where: {
        email: dataSession.email,
        type: UserTypeEnum.USER,
      },
    });
    if (!isValidEmail) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Account-not-valid', {
          lang: 'vi',
        }),
        'NOT_FOUND',
      );
    }
    const user = await this.validateUserCreds(dataSession.email, data.password);
    // const payload = { userId: user.id, system_code, client_id };
    // const token = this.jwtService.sign(payload);

    // await this.systemTokenRepository.save({
    //   refresh_token: token,
    //   user_id: user.id,
    //   system_code,
    //   client_id,
    // });
    const passwordExpiryMonths = parseInt(
      this.configService.get<string>('PASSWORD_EXPIRY_MONTHS', '3'),
      10,
    );
    const passwordExpiryDate = new Date(user.password_updated_at);
    passwordExpiryDate.setMonth(
      passwordExpiryDate.getMonth() + passwordExpiryMonths,
    );

    if (new Date() > passwordExpiryDate) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('auth.password-expired'),
        'PASSWORD_EXPIRED',
      );
    }
    const consentToken = this.createConsentToken(user);
    return ResponseUtil.sendSuccessResponse({
      data: {
        consentToken,
        email: dataSession.email,
        system_name: system?.data?.name,
        ...query,
        two_factor: {
          enable: user.two_factor_enable,
          is_secret_token: user.two_factor_secret ? true : false,
          is_confirmed: user.two_factor_confirmed_at ? true : false,
        },
      },
    });
  }
  async generateDeviceId() {
    try {
      let random: string;
      let isUnique = false;

      while (!isUnique) {
        random = Math.random().toString(36).substring(2, 15);
        const existingDevice = await this.deviceLoginHistoryRepository.findOne({
          where: {
            device_identifier: random,
          },
        });

        if (!existingDevice) {
          isUnique = true;
        }
      }

      return ResponseUtil.sendSuccessResponse({ data: random });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }
  async getDeviceLoginHistories(deviceId) {
    try {
      const deviceSessions = await this.deviceSessionRepository.find({
        where: { device_id: deviceId },
        relations: ['user'],
      });
      const filteredSessions = deviceSessions.filter(
        (session) => session.user.type === UserTypeEnum.USER,
      );
      // const deviceLoginHistories = await this.deviceLoginHistoryRepository.find(
      //   {
      //     where: {
      //       device_identifier: deviceId,
      //     },
      //     relations: ['user'],
      //   },
      // );
      const formattedData = DeviceSessionDto.mapFromEntities(filteredSessions);
      return ResponseUtil.sendSuccessResponse({ data: formattedData });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async checkDeviceLoginHistories(data) {
    try {
      const deviceSession = await this.deviceSessionRepository.findOne({
        where: { device_id: data?.device_id, user: { email: data?.email } },
      });
      // const deviceLoginHistories =
      //   await this.deviceLoginHistoryRepository.findOne({
      //     where: {
      //       device_identifier: data?.device_id,
      //       account_identifier: data?.email,
      //     },
      //   });
      if (!deviceSession) {
        return ResponseUtil.sendErrorResponse('NOT_FOUND', 'NOT_FOUND');
      }
      // await this.verifyRefreshToken(data?.refresh_token);
      const user = await this.userRepository.findOne({
        where: { email: data?.email },
      });
      const authTempCode = await this.createAuthTempCode(user);
      return ResponseUtil.sendSuccessResponse({ data: authTempCode });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async confirmSSO_UCMS(data) {
    try {
      const system = await this.systemRepository.findOne({
        where: {
          client_id: data?.client_id,
        },
      });
      if (!system) {
        return ResponseUtil.sendErrorResponse(
          'Client id not found',
          'CLIENT_ID_NOT_FOUND',
        );
      }

      const dataVerify = await this.verifyConsentToken(data?.consent_token);
      const user = await this.userService.getUserById(dataVerify?.id);
      const authTempCode = await this.createAuthTempCode(user);
      const device = await this.deviceLoginHistoryRepository.findOne({
        where: {
          device_identifier: data?.device_id,
          account_identifier: user?.email,
          user: { id: user?.id },
        },
      });
      if (device) {
        await this.deviceLoginHistoryRepository.update(
          { id: device.id },
          {
            last_login_at: new Date(),
          },
        );
      } else {
        await this.deviceLoginHistoryRepository.save({
          user: user,
          account_identifier: user?.email,
          device_identifier: data?.device_id,
          last_login_at: new Date(),
        });
      }
      const deviceId = data?.device_id;
      return ResponseUtil.sendSuccessResponse({
        data: {
          authTempCode,
          device_id: deviceId,
        },
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async updateAccessTokenDeviceLoginHistory(data: any) {
    try {
      const device = await this.deviceLoginHistoryRepository.findOne({
        where: {
          device_identifier: data?.device_id,
          account_identifier: data?.email,
        },
      });
      if (!device) {
        return ResponseUtil.sendErrorResponse(
          'Device not found',
          'DEVICE_NOT_FOUND',
        );
      }
      await this.deviceLoginHistoryRepository.update(
        { id: device.id },
        {
          session_token: data?.session_token,
        },
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getSSO_Token_UCMS(data, metaData) {
    try {
      const system = await this.systemRepository.findOne({
        where: {
          client_id: data?.client_id,
        },
      });
      if (!system) {
        return ResponseUtil.sendErrorResponse(
          'Client id not found',
          'CLIENT_ID_NOT_FOUND',
        );
      }
      // cái redirect_uri nó mã hóa mấy cái ký tự đặc biệt nên không so sánh được
      // if (system?.redirect_uris.indexOf(data?.redirect_uri) === -1) {
      //   return ResponseUtil.sendErrorResponse(
      //     'Invalid redirect uri',
      //     'INVALID_REDIRECT_URI',
      //   );
      // }
      const clientSecret = await this.systemClientSecretRepository.findOne({
        where: {
          system: { id: system.id },
          client_secret: data?.client_secret,
          is_enabled: true,
        },
      });
      if (!clientSecret) {
        return ResponseUtil.sendErrorResponse(
          'Invalid client secret',
          'INVALID_CLIENT_SECRET',
        );
      }

      const dataVerify = await this.verifyAuthTempCode(data.auth_code);
      // const user = await this.userRepository
      //   .createQueryBuilder('user')
      //   .leftJoinAndSelect('user.roles', 'role')
      //   .leftJoinAndSelect('role.permissions', 'rolePermission')
      //   .leftJoinAndSelect('user.userHasPermissions', 'userHasPermission')
      //   .leftJoinAndSelect('userHasPermission.permission', 'directPermission')
      //   .where('user.id = :userId', { userId: dataVerify.id })
      //   .getOne();
      const user = await this.userRepository.findOne({
        where: { id: dataVerify.id },
      });

      // const rolePermissions = user.roles.flatMap((role) => role.permissions);
      // const directPermissions = user.userHasPermissions
      //   .filter((userHasPermission) => userHasPermission.is_direct)
      //   .map((userHasPermission) => userHasPermission.permission);

      // const ignoredPermissions = new Set(
      //   user.userHasPermissions
      //     .filter(
      //       (userHasPermission) =>
      //         !userHasPermission.is_direct &&
      //         userHasPermission.status === UserPermissionStatusEnum.IGNORED,
      //     )
      //     .map((userHasPermission) => userHasPermission.permission.id),
      // );

      // const finalPermissions = [
      //   ...rolePermissions,
      //   ...directPermissions,
      // ].filter((permission) => !ignoredPermissions.has(permission.id));

      // const systemCode = system.code;
      // const newFinalPermissions = finalPermissions
      //   .filter((permission) => permission.code.startsWith(systemCode))
      //   .map((permission) => ({
      //     code: permission.code,
      //     name: permission.name,
      //   }));

      // const finalToken = await this.createFinalToken(user, newFinalPermissions);
      const finalToken = await this.createFinalToken(user);
      const deviceSession = await this.deviceSessionService.handleDeviceSession(
        user.id,
        metaData,
        system,
      );
      const uuid = Buffer.from(user.id.toString()).toString('base64');
      const dataRes = {
        access_token: deviceSession.token,
        refresh_token: deviceSession.refreshToken,
        expired_at: deviceSession.expiredAt,
        uuid,
      };
      // await this.userLoginHistoryService.recordLogin({
      //   id: user.id,
      //   device_id: data.device_id,
      //   token: finalToken,
      // });
      return ResponseUtil.sendSuccessResponse({ ...dataRes });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getPermissionsForSystem(
    userId: number,
    clientId: string,
    clientSecret: string,
  ) {
    // Find the system using client_id
    const system = await this.systemRepository.findOne({
      where: {
        client_id: clientId,
      },
    });

    if (!system) {
      throw new Error('Client id not found');
    }

    // Check if the provided client secret exists for the system
    const clientSecretEntity = await this.systemClientSecretRepository.findOne({
      where: {
        system: { id: system.id },
        client_secret: clientSecret,
        is_enabled: true,
      },
    });
    if (!clientSecretEntity) {
      throw new Error('Invalid client secret');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermission')
      .leftJoinAndSelect('user.userHasPermissions', 'userHasPermission')
      .leftJoinAndSelect('userHasPermission.permission', 'directPermission')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new Error('User not found');
    }

    const rolePermissions = user.roles.flatMap((role) => role.permissions);
    const directPermissions = user.userHasPermissions
      .filter((userHasPermission) => userHasPermission.is_direct)
      .map((userHasPermission) => userHasPermission.permission);

    const ignoredPermissions = new Set(
      user.userHasPermissions
        .filter(
          (userHasPermission) =>
            !userHasPermission.is_direct &&
            userHasPermission.status === UserPermissionStatusEnum.IGNORED,
        )
        .map((userHasPermission) => userHasPermission.permission.id),
    );

    const finalPermissions = [...rolePermissions, ...directPermissions].filter(
      (permission) => !ignoredPermissions.has(permission.id),
    );

    const filteredPermissions = finalPermissions
      .filter((permission) => permission.code.startsWith(system.code))
      .map((permission) => ({
        code: permission.code,
        description: permission.description,
      }));

    const permissionHierarchy = {};

    for (const { code } of filteredPermissions) {
      const [systemCode, subsystemCode, moduleCode, actionCode] =
        code.split('-');

      // Retrieve names from the database for each part of the hierarchy
      const systemName = await this.systemRepository.findOne({
        where: { code: systemCode },
        select: ['name', 'code'],
      });
      const subsystem = await this.subsystemRepository.findOne({
        where: { code: subsystemCode },
        select: ['name', 'code'],
      });
      const module = await this.moduleRepository.findOne({
        where: { code: moduleCode },
        select: ['name', 'code'],
      });
      const action = await this.actionRepository.findOne({
        where: { code: actionCode },
        select: ['name', 'code'],
      });

      if (!subsystem || !module || !action) {
        continue; // Skip if any part of the hierarchy is missing
      }

      if (!permissionHierarchy[systemCode]) {
        permissionHierarchy[systemCode] = { name: systemName, subsystems: {} };
      }

      if (!permissionHierarchy[systemCode].subsystems[subsystemCode]) {
        permissionHierarchy[systemCode].subsystems[subsystemCode] = {
          name: subsystem.name,
          modules: {},
        };
      }

      if (
        !permissionHierarchy[systemCode].subsystems[subsystemCode].modules[
          moduleCode
        ]
      ) {
        permissionHierarchy[systemCode].subsystems[subsystemCode].modules[
          moduleCode
        ] = { name: module.name, actions: {} };
      }

      // Assign the action with its name
      permissionHierarchy[systemCode].subsystems[subsystemCode].modules[
        moduleCode
      ].actions[actionCode] = {
        name: action.name,
      };
    }

    return permissionHierarchy;
  }

  // public getCookieWithJwtAccessToken(
  //   userId: number,
  //   isSecondFactorAuthenticated = false,
  // ) {
  //   const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
  //     expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
  //   });
  //   return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
  //     'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
  //   )}`;
  // }

  // public getCookieWithJwtRefreshToken(userId: number) {
  //   const payload: TokenPayload = { userId };
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
  //     expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
  //   });
  //   const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
  //     'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
  //   )}`;
  //   return {
  //     cookie,
  //     token,
  //   };
  // }

  async updatePassword(body) {
    const oldPassword = body?.old_password;
    const user = await this.userRepository.findOne({
      where: {
        email: body?.email,
      },
    });
    if (!user) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.email.not-found', {
          lang: 'vi',
        }),
      );
    }
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new UnprocessableEntityException({
        errors: {
          old_password: [
            this.i18n.t('auth.password', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('auth.old-password', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    await this.userRepository.update(
      { email: body?.email },
      {
        password: await bcrypt.hash(body?.password, 10),
        password_updated_at: new Date(),
      },
    );
    await this.userRepository.update(
      { email: body?.email },
      {
        password_updated_at: new Date(),
      },
    );
    const accessToken = await this.createAdminToken(user);
    const refreshToken = await this.createRefreshToken(user);
    await this.updateLastLoginAtAndResetBlock(user.id);
    const dataRes = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    return ResponseUtil.sendSuccessResponse(
      { data: dataRes },
      this.i18n.t('message.Update-password-successfully', {
        lang: 'vi',
      }),
    );
  }

  async updateSSOPassword(body, query) {
    const oldPassword = body?.old_password;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: body?.email,
        },
      });
      if (!user) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.email.not-found', {
            lang: 'vi',
          }),
        );
      }
      if (!(await bcrypt.compare(oldPassword, user.password))) {
        throw new UnprocessableEntityException({
          errors: {
            old_password: [
              this.i18n.t('auth.password', {
                lang: 'vi',
              }),
            ],
          },
          message: this.i18n.t('auth.old-password', {
            lang: 'vi',
          }),
          error: 'Unprocessable Entity',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      await this.userRepository.update(
        { email: body?.email },
        {
          password: await bcrypt.hash(body?.password, 10),
          password_updated_at: new Date(),
        },
      );
      await this.userRepository.update(
        { email: body?.email },
        {
          password_updated_at: new Date(),
        },
      );
      this.verifySession(query?.session_token);
      const consentToken = this.createConsentToken(user);

      await queryRunner.commitTransaction();
      return ResponseUtil.sendSuccessResponse(
        {
          data: {
            consentToken,
            email: body?.email,
            system_name: query?.system_name,
            ...query,
            two_factor: {
              enable: user.two_factor_enable,
              is_secret_token: user.two_factor_secret ? true : false,
              is_confirmed: user.two_factor_confirmed_at ? true : false,
            },
          },
        },
        this.i18n.t('message.Update-password-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async getSecretKey(request): Promise<string> {
    const headers = request.headers;
    const payload = JwtStrategy.decode(headers.authorization) as JwtPayload;
    const { id, deviceId, exp } = payload;
    const keyCache = this.getKeyCache(id, deviceId);
    const secretKeyFromCache: string = await this.cacheManager.get(keyCache);

    if (secretKeyFromCache) return secretKeyFromCache;

    const { secret_key } = await this.deviceSessionRepository
      .createQueryBuilder('deviceSessions')
      .where('deviceSessions.device_idd = :deviceId', { deviceId })
      .andWhere('deviceSessions.user_id = :id', { id })
      .getOne();

    await this.cacheManager.set(
      keyCache,
      secret_key,
      (exp - Math.floor(Date.now() / 1000)) * 1000,
    );
    return secret_key;
  }

  getKeyCache(userId, deviceId): string {
    return `sk_${userId}_${deviceId}`;
  }
}
