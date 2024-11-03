import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { ResponseUtil } from '@/utils/response-util';
import { InjectRepository } from '@nestjs/typeorm';
import { System } from '@/modules/system/entities/system.entity';
import { Repository } from 'typeorm';
import { SystemToken } from '@/modules/system-token/entities/system-token.entity';
import { User } from '@/modules/user/user.entity';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private userService: UserService,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
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
    private readonly systemService: SystemService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly userLoginHistoryService: UserLoginHistoryService,
  ) {}

  // Tạo admin token
  async createAdminToken(admin: any) {
    const payload = { email: admin.email, id: admin.id, role: 'admin' };
    const token = this.jwtService.sign(payload, {
      expiresIn: '5h',
    });

    await this.redisService.saveSession(
      `admin-session:${admin.id}`,
      token,
      18000,
    );
    return token;
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
  async verifyToken(token: string) {
    const isBlacklisted = await this.redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-token', {
          lang: 'vi',
        }),
      );
    }
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (e) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        e.message,
      );
    }
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

    if (!(await bcrypt.compare(password, user.password))) {
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

  async checkEmailExist(email: string, query: any) {
    try {
      await this.systemService.checkClientIdAndRedirectUri(query);
      const user = await this.userService.getUserByEmail(email);
      const sessionToken = this.createSession(user);
      return ResponseUtil.sendSuccessResponse({
        data: {
          sessionToken,
          email,
          ...query,
        },
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  async loginWithUCSM(data: any, query) {
    try {
      const system =
        await this.systemService.checkClientIdAndRedirectUri(query);
      if (system?.data === null) {
        return ResponseUtil.sendErrorResponseWithNoException(
          'Invalid client_id or redirect_uri',
          'INVALID_CLIENT_ID_OR_REDIRECT_URI',
        );
      }
      const dataSession = this.verifySession(query?.session_token);

      const user = await this.validateUserCreds(
        dataSession.email,
        data.password,
      );
      // const payload = { userId: user.id, system_code, client_id };
      // const token = this.jwtService.sign(payload);

      // await this.systemTokenRepository.save({
      //   refresh_token: token,
      //   user_id: user.id,
      //   system_code,
      //   client_id,
      // });
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
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
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
      const deviceLoginHistories = await this.deviceLoginHistoryRepository.find(
        {
          where: {
            device_identifier: deviceId,
          },
          relations: ['user'],
        },
      );
      const formattedData =
        DeviceLoginHistoryDto.mapFromEntities(deviceLoginHistories);
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
      const deviceLoginHistories =
        await this.deviceLoginHistoryRepository.findOne({
          where: {
            device_identifier: data?.device_id,
            account_identifier: data?.email,
          },
        });
      if (!deviceLoginHistories) {
        return ResponseUtil.sendErrorResponse('NOT_FOUND', 'NOT_FOUND');
      }
      await this.verifyFinalToken(deviceLoginHistories?.session_token);
      const user = await this.userRepository.findOne({
        where: { id: data?.user_id },
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

  async confirmSSO_UCMS(data: any) {
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

  async getSSO_Token_UCMS(data: any) {
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
      // await this.userLoginHistoryService.recordLogin({
      //   id: user.id,
      //   device_id: data.device_id,
      //   token: finalToken,
      // });
      return ResponseUtil.sendSuccessResponse({ data: finalToken });
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
        name: permission.name,
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

  public getCookieWithJwtAccessToken(
    userId: number,
    isSecondFactorAuthenticated = false,
  ) {
    const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  public getCookieWithJwtRefreshToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
    return {
      cookie,
      token,
    };
  }
}
