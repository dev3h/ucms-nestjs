import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  Body,
  UnauthorizedException,
  HttpCode,
  Request,
  Headers,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { Response } from 'express';
import JwtAuthenticationGuard from '../guard/jwt-authentication.guard';
import { TwoFactorAuthenticationCodeDto } from './dto/twoFactorAuthenticationCode.dto';
import { UserService } from '@/modules/user/user.service';
import { AuthService } from '../login/auth.service';
import RequestWithUser from '../requestWithUser.interface';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ResponseUtil } from '@/utils/response-util';
import { JwtUserGuard } from '../guard/jwt-user.guard';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@ApiTags('MFA')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UserService,
    private readonly authenticationService: AuthService,
    private readonly i18n: I18nService,
    private authService: AuthService,
  ) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'client_id',
    description: 'Client ID của hệ thống',
    example: '123',
  })
  @ApiQuery({
    name: 'redirect_uri',
    description: 'Redirect URI khi login thành công',
    example: 'http://localhost:3000',
  })
  // @UseGuards(JwtUserGuard)
  @Post('generate')
  @HttpCode(200)
  // @UseGuards(JwtUserGuard)
  async register(@Body() data, @Res() response: Response, @Request() request) {
    try {
      const user = await this.authenticationService.verifyConsentToken(
        data?.consent_token,
      );
      const dataGenerate =
        await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
          user,
        );
      const secretCode = dataGenerate?.data?.secret;
      response.setHeader('X-Secret-Code', secretCode);

      return this.twoFactorAuthenticationService.pipeQrCodeStream(
        response,
        dataGenerate?.data?.otpauthUrl,
      );
    } catch (err) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        err?.message,
      );
    }
  }

  @ApiQuery({
    name: 'client_id',
    description: 'Client ID của hệ thống',
    example: '123',
  })
  @ApiQuery({
    name: 'redirect_uri',
    description: 'Redirect URI khi login thành công',
    example: 'http://localhost:3000',
  })
  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      request.user,
    );
    await this.userService.turnOnTwoFactorAuthentication(request.user.id);
  }

  @ApiQuery({
    name: 'client_id',
    description: 'Client ID của hệ thống',
    example: '123',
  })
  @ApiQuery({
    name: 'redirect_uri',
    description: 'Redirect URI khi login thành công',
    example: 'http://localhost:3000',
  })
  @Post('authenticate')
  @HttpCode(200)
  // @UseGuards(JwtAuthenticationGuard)
  async authenticate(@Body() data, @Req() request: RequestWithUser) {
    const dataVerify = await this.authenticationService.verifyConsentToken(
      data?.consent_token,
    );
    if (!dataVerify) {
      return ResponseUtil.sendErrorResponse(
        'Invalid consent token',
        'INVALID_CONSENT_TOKEN',
      );
    }
    const user = await this.userService.getUserById(dataVerify?.id);
    this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      data?.totpCode,
      user,
    );
    user.two_factor_confirmed_at = new Date();
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex');
      backupCodes.push(code);
    }
    // combine all codes to one string and encryption
    const recoveryCode = backupCodes.join(',');
    const saltRounds = 10;
    const hashedRecoveryCode = await bcrypt.hash(recoveryCode, saltRounds);
    user.two_factor_recovery_code = hashedRecoveryCode;
    user.save();
    delete data?.totpCode;
    return ResponseUtil.sendSuccessResponse({ data });
  }

  @Post('sso/challenge')
  @HttpCode(200)
  // @UseGuards(JwtAuthenticationGuard)
  async challenge(@Body() data, @Res() res) {
    const dataVerify = await this.authenticationService.verifyConsentToken(
      data?.consent_token,
    );

    const user = await this.userService.getUserById(dataVerify?.id);
    this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      data?.totpCode,
      user,
    );
    const code = await this.authenticationService.createAuthTempCode(user);
    const dataRes = ResponseUtil.sendSuccessResponse({ data: code });
    return res.status(200).json(dataRes);
  }

  @Post('challenge')
  @HttpCode(200)
  async twoFactorChallenge(
    @Req() req,
    @Body() data,
    @Res() res,
    @Headers() headers: Headers,
  ) {
    const dataVerify = await this.authenticationService.verifyTempCodeNoExpired(
      data?.tempToken,
    );
    const admin = await this.userService.getUserById(dataVerify?.id);
    this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      data?.totpCode,
      admin,
    );
    const fingerprint = req?.fp;
    const ipAddress = req.connection.remoteAddress;
    const ua = headers['user-agent'];
    const deviceId = fingerprint?.id;
    const os = fingerprint?.userAgent?.os?.family;
    const browser = fingerprint?.userAgent?.browser?.family;
    const metaData = { ipAddress, ua, deviceId, os, browser };
    const result = await this.authService.adminLoginAfterVerifyTwoFactor(
      admin,
      metaData,
    );

    if (result.status_code === 200) {
      if (result?.requireTwoFactor) {
        return res.send(result);
      }
      const { refresh_token, expired_at, uid } = result;
      res.cookie('admin_ucms_refresh_token', refresh_token, {
        httpOnly: true,
        expires: new Date(expired_at),
        sameSite: 'Strict',
      });
      res.cookie('uid', uid, {
        httpOnly: true,
        expires: new Date(expired_at),
        sameSite: 'Strict',
      });
      // res.cookie('device_id_session', device_id_session, {
      //   httpOnly: true,
      //   expires: new Date(expired_at),
      //   sameSite: 'Strict',
      // });
    }

    return res.send(result);
  }
}
