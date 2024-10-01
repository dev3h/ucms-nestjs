import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { User } from '@/modules/user/user.entity';
import { ResponseUtil } from '@/utils/response-util';
import { UserService } from '@/modules/user/user.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async generateTwoFactorAuthenticationSecret(user) {
    try {
      const secret = authenticator.generateSecret();

      const otpauthUrl = authenticator.keyuri(
        user?.email,
        this.configService.get('APP_NAME'),
        secret,
      );
      await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
      const data = {
        secret,
        otpauthUrl,
      };
      return ResponseUtil.sendSuccessResponse({ data }, 'Created successfully');
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.two_factor_secret,
    });
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }
}
