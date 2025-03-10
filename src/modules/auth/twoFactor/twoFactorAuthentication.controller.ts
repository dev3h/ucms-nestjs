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
  Response,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
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
import e from 'express';

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
  @Post('sso/generate')
  @HttpCode(200)
  // @UseGuards(JwtUserGuard)
  async register(
    @Body() data,
    @Res() response,
    @Request() request,
    @Req() req,
  ) {
    try {
      const consentToken = req.session.consentToken;
      const user =
        await this.authenticationService.verifyConsentToken(consentToken);
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

  @Post('admin/generate')
  @HttpCode(200)
  // @UseGuards(JwtUserGuard)
  async adminRegisterTwoFactor(@Body() data, @Res() response, @Req() req) {
    try {
      const hashToken = req.session.hashedTempToken;
      const isTokenValid = await bcrypt.compare(data?.tempToken, hashToken);
      if (!isTokenValid) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.invalid-token', {
            lang: 'vi',
          }),
        );
      }
      const [adminId] = data?.tempToken.split('-');
      const admin = await this.userService.getUserById(adminId);
      const dataGenerate =
        await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
          admin,
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
  // @Post('turn-on')
  // @HttpCode(200)
  // @UseGuards(JwtAuthenticationGuard)
  // async turnOnTwoFactorAuthentication(
  //   @Req() request: RequestWithUser,
  //   @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  // ) {
  //   this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
  //     twoFactorAuthenticationCode,
  //     request.user,
  //   );
  //   await this.userService.turnOnTwoFactorAuthentication(request.user.id);
  // }
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
  @Post('sso/authenticate')
  @HttpCode(200)
  // @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Body() data,
    @Req() request: RequestWithUser,
    @Req() req,
  ) {
    const consentToken = req.session.consentToken;

    const dataVerify =
      await this.authenticationService.verifyConsentToken(consentToken);
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
    const saltRounds = 10;
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, saltRounds)),
    );
    user.two_factor_recovery_code = hashedBackupCodes.join(',');
    await user.save();
    delete data?.totpCode;
    data.recoveryCodes = backupCodes;
    return ResponseUtil.sendSuccessResponse({ data });
  }
  @Post('admin/authenticate')
  @HttpCode(200)
  // @UseGuards(JwtAuthenticationGuard)
  async adminTwoFactorAuthenticate(@Body() data, @Req() req) {
    const hashToken = req.session.hashedTempToken;
    const isTokenValid = await bcrypt.compare(data?.tempToken, hashToken);
    if (!isTokenValid) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-token', {
          lang: 'vi',
        }),
      );
    }
    const [adminId] = data?.tempToken.split('-');
    const admin = await this.userService.getUserById(adminId);
    this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      data?.totpCode,
      admin,
    );
    admin.two_factor_confirmed_at = new Date();
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex');
      backupCodes.push(code);
    }
    const saltRounds = 10;
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, saltRounds)),
    );
    admin.two_factor_recovery_code = hashedBackupCodes.join(',');
    await admin.save();
    delete data?.totpCode;
    return ResponseUtil.sendSuccessResponse(
      {
        data: { recoveryCodes: backupCodes },
      },
      this.i18n.t('message.Setup-2fa-successfully', {
        lang: 'vi',
      }),
    );
  }

  @Post('sso/challenge')
  @HttpCode(200)
  // @UseGuards(JwtAuthenticationGuard)
  async challenge(@Body() data, @Res() res, @Req() req) {
    const consentToken = req.session.consentToken;
    if (!consentToken) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-token', {
          lang: 'vi',
        }),
        'INVALID_CONSENT_TOKEN',
      );
    }
    const dataVerify =
      await this.authenticationService.verifyConsentToken(consentToken);

    const user = await this.userService.getUserById(dataVerify?.id);
    if (data?.totpCode) {
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        data?.totpCode,
        user,
      );
    } else {
      await this.twoFactorAuthenticationService.isValidRecoveryCode(
        data?.recoveryCode,
        user,
      );
    }

    const code = await this.authenticationService.createAuthTempCode(user);
    const dataRes = ResponseUtil.sendSuccessResponse({ data: code });
    return res.status(200).json(dataRes);
  }

  @Post('challenge')
  @HttpCode(200)
  async twoFactorChallenge(
    @Req() req,
    @Body() data,
    @Response() res,
    @Headers() headers: Headers,
  ) {
    try {
      // const dataVerify = await this.authenticationService.verifyTempCodeNoExpired(
      //   data?.tempToken,
      // );
      const hashToken = req.session.hashedTempToken;
      if (!hashToken) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.invalid-token', {
            lang: 'vi',
          }),
          'INVALID_CONSENT_TOKEN',
        );
      }
      const isTokenValid = await bcrypt.compare(data?.tempToken, hashToken);
      if (!isTokenValid) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.invalid-token', {
            lang: 'vi',
          }),
        );
      }
      const [adminId] = data?.tempToken.split('-');
      const admin = await this.userService.getUserById(adminId);
      if (data?.totpCode) {
        this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          data?.totpCode,
          admin,
        );
      } else {
        this.twoFactorAuthenticationService.isValidRecoveryCode(
          data?.recoveryCode,
          admin,
        );
      }
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
        return res.status(200).send(result);
      }

      return res.send(result);
    } catch (err) {
      throw err;
    }
  }
}
