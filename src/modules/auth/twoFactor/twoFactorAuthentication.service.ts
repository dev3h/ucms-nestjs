import { HttpStatus, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
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

  public async generateTwoFactorAuthenticationSecret(user: User) {
    try {
      const secret = speakeasy.generateSecret({ length: 20 });

      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: `${this.configService.get('APP_NAME')}:${user.email}`,
        issuer: this.configService.get('APP_NAME'),
        encoding: 'base32',
      });

      await this.userService.setTwoFactorAuthenticationSecret(
        secret.base32,
        user.id,
      );
      const data = {
        secret: secret.base32,
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
    // Kiểm tra mã 2FA dựa trên secret của người dùng và tên ứng dụng
    const isCodeValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32', // Speakeasy sử dụng base32 để mã hóa secret
      token: twoFactorAuthenticationCode,
    });

    // Nếu mã không hợp lệ hoặc không đúng ứng dụng, thông báo lỗi
    if (!isCodeValid) {
      throw new UnprocessableEntityException({
        errors: {
          totpCode: [
            this.i18n.t('validation.totpCode', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('validation.totpCode', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    return isCodeValid;
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }
}
