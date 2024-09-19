import {
  HttpStatus,
  Injectable,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private userService: UserService,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    @InjectRepository(SystemToken)
    private readonly systemTokenRepository: Repository<SystemToken>,
    private jwtService: JwtService,
  ) {}

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

  generateToken(user: any) {
    return {
      access_token: this.jwtService.sign({
        name: user.name,
        sub: user.id,
      }),
    };
  }

  async login(data: any) {
    const user = await this.validateUserCreds(data.email, data.password);
    return this.generateToken(user);
  }

  async loginRedirectUCSM(data: any) {
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

      const user = await this.validateUserCreds(data.email, data.password);
      const payload = { userId: user.id, system_code, client_id };
      const token = this.jwtService.sign(payload);

      await this.systemTokenRepository.save({
        refresh_token: token,
        user_id: user.id,
        system_code,
        client_id,
      });
      return ResponseUtil.sendSuccessResponse({ token });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }
}
