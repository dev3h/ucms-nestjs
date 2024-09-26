import {
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ResponseUtil } from '@/utils/response-util';
import { InjectRepository } from '@nestjs/typeorm';
import { System } from '@/modules/system/entities/system.entity';
import { Repository } from 'typeorm';
import { SystemToken } from '@/modules/system-token/entities/system-token.entity';
import { User } from '@/modules/user/user.entity';
import { ConfigService } from '@nestjs/config';
import TokenPayload from '../tokenPayload.interface';
import { RedisService } from '@/modules/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private userService: UserService,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SystemToken)
    private readonly systemTokenRepository: Repository<SystemToken>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  // Tạo admin token
  async createAdminToken(admin: any) {
    const payload = { email: admin.email, sub: admin.id, role: 'admin' };
    const token = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    await this.redisService.saveSession(
      `admin-session:${admin.id}`,
      token,
      3600,
    );
    return token;
  }

  // Tạo user token
  async createUserToken(user: any) {
    const payload = { email: user.email, sub: user.id, role: 'user' };
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
      throw new UnauthorizedException('Token is blacklisted');
    }

    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
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
    const payload = { email: user.email, sub: user.id }; // payload chứa email và id người dùng

    // Tạo token JWT với thời gian hết hạn là 10 phút
    return this.jwtService.sign(payload, { expiresIn: '10m' });
  }

  // Xác thực consent token khi người dùng đồng ý quyền
  verifyConsentToken(token: string): any {
    try {
      return this.jwtService.verify(token); // xác thực token
    } catch (e) {
      throw new Error('Invalid consent token');
    }
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

  // Tạo JWT cho hệ thống ngoài sau khi người dùng đồng ý quyền truy cập
  createFinalToken(user: any): string {
    const payload = {
      email: user.email,
      sub: user.id,
      permissions: user.permissions,
    };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  async login(user: any) {
    // const user = await this.validateUserCreds(data.username, data.password);
    // return await this.generateToken(user);
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async checkEmailExist(email: string) {
    try {
      const user = await this.userService.getUserByEmail(email);
      const sessionToken = this.createSession(user);
      return ResponseUtil.sendSuccessResponse({ data: sessionToken });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  async loginWithUCSM(data: any) {
    try {
      const system_code = data.systemCode;
      const redirect_uri = data.redirectUri;
      const client_id = data.clientId;

      const isSystemCodeExist = await this.systemRepository.findOne({
        where: { code: system_code },
      });
      if (!isSystemCodeExist) {
        return ResponseUtil.sendErrorResponse(
          'System not found',
          'SYS_CODE_NOT_FOUND',
        );
      }
      const isRedirectUriExist = await this.systemRepository.findOne({
        where: { redirect_uris: redirect_uri },
      });
      if (!isRedirectUriExist) {
        return ResponseUtil.sendErrorResponse(
          'Redirect uri not found',
          'REDIRECT_URI_NOT_FOUND',
        );
      }
      const isClientIdExist = await this.systemRepository.findOne({
        where: { client_id },
      });
      if (!isClientIdExist) {
        return ResponseUtil.sendErrorResponse(
          'Client id not found',
          'CLIENT_ID_NOT_FOUND',
        );
      }
      const sessionToken = data.sessionToken;
      const dataSession = this.verifySession(sessionToken);

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
      return ResponseUtil.sendSuccessResponse({ data: consentToken });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  async confirmLoginWithUCSM(data: any) {
    try {
      const system_code = data.systemCode;
      const client_id = data.clientId;
      const refresh_token = data.refreshToken;

      const isSystemCodeExist = await this.systemRepository.findOne({
        where: { code: system_code },
      });
      if (!isSystemCodeExist) {
        return ResponseUtil.sendErrorResponse(
          'System not found',
          'SYS_CODE_NOT_FOUND',
        );
      }

      const isClientIdExist = await this.systemRepository.findOne({
        where: { client_id },
      });
      if (!isClientIdExist) {
        return ResponseUtil.sendErrorResponse(
          'Client id not found',
          'CLIENT_ID_NOT_FOUND',
        );
      }

      const isRefreshTokenExist = await this.systemTokenRepository.findOne({
        where: { refresh_token },
      });
      if (!isRefreshTokenExist) {
        return ResponseUtil.sendErrorResponse(
          'Refresh token not found',
          'REFRESH_TOKEN_NOT_FOUND',
        );
      }
      const user = this.verifyConsentToken(data.consentToken);
      const finalToken = this.createFinalToken(user);
      return ResponseUtil.sendSuccessResponse({ data: finalToken });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
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
