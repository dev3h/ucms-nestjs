import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  Response,
  Query,
  Param,
  Headers,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from '../dto/login.dto';
import { EmailRequestDto } from '../dto/email.dto';
import { ResponseUtil } from '@/utils/response-util';
import { UserTypeEnum } from '@/modules/user/enums/user-type.enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { DeviceSessionService } from '@/modules/device-session/device-session.service';
import ReAuthDto from '../dto/re-auth.dto';
import { UserService } from '@/modules/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private deviceSessionService: DeviceSessionService,
    private readonly userService: UserService,
  ) {}

  // @ApiTags('Auth')
  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // @HttpCode(200)
  // async login(@Request() req, @Response() res, @Body() data: LoginRequestDto) {
  //   const token = await this.authService.login(req.user);
  //   const response = ResponseUtil.sendSuccessResponse({ data: token });
  //   return res.status(200).json(response);
  // }

  // @ApiTags('Auth')
  // @UseGuards(LocalAuthGuard)
  // @Post('login-ucms')
  // @HttpCode(200)
  // async loginUcms(
  //   @Req() request: RequestWithUser,
  //   @Response() res,
  //   @Body() data: LoginSSOUCMSRequestDto,
  // ) {
  //   try {
  //     const { user } = request;
  //     const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
  //       user.id,
  //     );
  //     const { cookie: refreshTokenCookie, token: refreshToken } =
  //       this.authService.getCookieWithJwtRefreshToken(user.id);

  //     await this.userService.setCurrentRefreshToken(refreshToken, user.id);

  //     request.res.setHeader('Set-Cookie', [
  //       accessTokenCookie,
  //       refreshTokenCookie,
  //     ]);

  //     if (user.two_factor_enable) {
  //       const data = {
  //         twoFactor: true,
  //       };
  //       return res.status(200).json({ data });
  //     }

  //     return user;
  //   } catch (error) {
  //     return ResponseUtil.sendErrorResponse(
  //       'Something went wrong',
  //       error.message,
  //     );
  //   }
  //   // const token = await this.authService.loginWithUCSM(data);
  //   // return res.status(200).json(token);
  // }

  // @ApiTags('Auth')
  // @ApiBearerAuth()
  // @UseGuards(JwtAdminGuard)
  // @Get('user')
  // async user(@Request() req): Promise<any> {
  //   return req.user;
  // }

  @ApiTags('Auth')
  @ApiOkResponse({
    description: 'Admin đăng nhập thông tin thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  // @Throttle({ default: { ttl: 2000, limit: 1 } })
  @Post('admin/login')
  @HttpCode(200)
  async adminLogin(
    @Req() req,
    @Response() res,
    @Body() data: LoginRequestDto,
    @Headers() headers: Headers,
  ) {
    const fingerprint = req?.fp;
    const ipAddress = req.connection.remoteAddress;
    const ua = headers['user-agent'];
    const deviceId = fingerprint?.id;
    const os = fingerprint?.userAgent?.os?.family;
    const browser = fingerprint?.userAgent?.browser?.family;
    const metaData = { ipAddress, ua, deviceId, os, browser };
    const result = await this.authService.adminLogin(data, metaData);

    if (result.status_code === 200) {
      const { refresh_token, expired_at } = result;
      res.cookie('admin_ucms_refresh_token', refresh_token, {
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

  @ApiTags('Auth')
  @Post('admin/refresh-token')
  @HttpCode(200)
  async reAuth(@Req() req, @Response() res) {
    const fingerprint = req?.fp;
    const deviceId = fingerprint?.id;
    const refreshToken = req.cookies?.admin_ucms_refresh_token;
    const result = await this.deviceSessionService.reAuth(
      deviceId,
      refreshToken,
    );
    if (result.status_code === 200) {
      const { refresh_token, expired_at } = result;
      res.cookie('admin_ucms_refresh_token', refresh_token, {
        httpOnly: true,
        expires: new Date(expired_at),
        sameSite: 'Strict',
      });
    }
    return res.send(result);
  }
  // async refreshToken(@Req() req, @Response() res) {
  //   const token = req.headers.authorization.split(' ')[1];
  //   const decodedToken = await this.authService.verifyToken(token);
  //   // const user = await this.authService.getUserById(decodedToken.id);
  //   // const refreshToken = req.cookies?.refresh_token;
  //   // const newToken = await this.authService.refreshToken(user, refreshToken);
  //   // const dataRes = ResponseUtil.sendSuccessResponse({
  //   //   data: {
  //   //     access_token: newToken,
  //   //   },
  //   // });
  //   // return res.status(200).json(dataRes);
  // }

  @ApiTags('Auth')
  @Post('admin/password-update')
  @HttpCode(200)
  updatePassword(@Body() data: UpdatePasswordDto) {
    return this.authService.updatePassword(data);
  }

  @ApiTags('Auth')
  @Get('/admin/me')
  async getAdmin(@Req() req) {
    const token = req.headers.authorization?.split(' ')?.[1];
    const fingerprint = req?.fp;
    const deviceId = fingerprint?.id;
    const payload = await this.authService.verifyToken(token, deviceId);
    return this.userService.findOne(payload?.id);
  }

  @ApiTags('Auth')
  @Post('admin/logout')
  async logout(@Req() req, @Response() res) {
    const token = req.headers.authorization.split(' ')?.[1];
    const fingerprint = req?.fp;
    const deviceId = fingerprint?.id;
    const decodedToken = await this.authService.verifyToken(token, deviceId);
    // if (decodedToken.status_code !== 200) {
    //   return res.status(decodedToken.status_code).json(decodedToken);
    // }
    await this.deviceSessionService.logout(
      decodedToken.id,
      decodedToken.deviceId,
    );
    return res.status(200).json({ message: 'Successfully logged out' });
  }

  // sso ucms api

  @ApiTags('Auth Redirect UCMS')
  @Post('generate-device-id')
  @HttpCode(200)
  async generateDeviceId() {
    return await this.authService.generateDeviceId();
  }

  @ApiTags('Auth Redirect UCMS')
  @Post('/sso-ucms/check-info-system')
  @HttpCode(200)
  checkCorrectSystem(@Body() body) {
    return this.authService.checkClientIdAndRedirectUri(body);
  }

  @ApiTags('Auth Redirect UCMS')
  @Get('get-device-login-histories/:device_id')
  async getDeviceLoginHistories(@Param('device_id') device_id: string) {
    return await this.authService.getDeviceLoginHistories(device_id);
  }
  @ApiTags('Auth Redirect UCMS')
  @Post('check-account-device-history')
  @HttpCode(200)
  async checkDeviceLoginHistories(@Body() body: any) {
    return await this.authService.checkDeviceLoginHistories(body);
  }
  // Login Redirect UCMS
  @ApiTags('Auth Redirect UCMS')
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
  @Post('check-email-exist')
  @HttpCode(200)
  async checkEmailExist(
    @Body() data: EmailRequestDto,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Res() res,
  ) {
    const query = {
      client_id: clientId,
      redirect_uri: redirectUri,
    };
    const response = await this.authService.checkEmailExist(data.email, query);
    const resData = ResponseUtil.sendSuccessResponse(response);
    return res.status(200).json(resData);
  }
  @ApiTags('Auth Redirect UCMS')
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
  @Post('oauth-ucms/login')
  @HttpCode(200)
  async oauthLogin(
    @Body() data: LoginRequestDto,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('session_token') sessionToken: string,
    @Response() res,
  ) {
    const query = {
      client_id: clientId,
      redirect_uri: redirectUri,
      session_token: sessionToken,
    };
    const response = await this.authService.loginWithUCSM(data, query);
    const dataRes = ResponseUtil.sendSuccessResponse(response);
    return res.status(200).json(dataRes);
  }

  @ApiTags('Auth Redirect UCMS')
  @Post('sso-ucms/confirm')
  @HttpCode(200)
  async confirmSSO_UCMS(@Req() req, @Body() data, @Response() res) {
    const deviceId = req.cookies?.deviceId;
    if (deviceId) {
      data.device_id = deviceId;
    }

    const response = await this.authService.confirmSSO_UCMS(data);
    const dataRes = ResponseUtil.sendSuccessResponse(response);
    return res.status(200).json(dataRes);
  }

  @ApiTags('Auth Redirect UCMS')
  @Post('sso-ucms/get-token')
  @HttpCode(200)
  async getTokenSSO_UCMS(
    @Req() req,
    @Body() data,
    @Response() res,
    @Headers() headers: Headers,
  ) {
    const fingerprint = req?.fp;
    const ipAddress = req.connection.remoteAddress;
    const ua = headers['user-agent'];
    const deviceId = fingerprint?.id;
    const os = fingerprint?.userAgent?.os?.family;
    const browser = fingerprint?.userAgent?.browser?.family;
    const metaData = { ipAddress, ua, deviceId, os, browser };
    const result = await this.authService.getSSO_Token_UCMS(data, metaData);
    if (result.status_code === 200) {
      const { refresh_token, expired_at } = result;
      res.cookie('sso_ucms_refresh_token', refresh_token, {
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

  @ApiTags('Auth Redirect UCMS')
  @Post('sso-ucms/me')
  async meSSO_UCMS(
    @Req() request: Request,
    @Body() body,
    @Req() req,
    @Res() res,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    const device_id = request.cookies?.deviceId;
    const fingerprint = req?.fp;
    const deviceId = fingerprint?.id;
    const decodedToken = await this.authService.verifyToken(token, deviceId);

    // const deviceId = request.cookies?.deviceId;
    // if (deviceId) {
    //   await this.authService.updateAccessTokenDeviceLoginHistory({
    //     device_id: deviceId,
    //     session_token: token,
    //     ...decodedToken,
    //   });
    // }
    const permissions = await this.authService.getPermissionsForSystem(
      decodedToken.id,
      body.client_id,
      body.client_secret,
    );

    const dataRes = ResponseUtil.sendSuccessResponse({
      data: {
        ...decodedToken,
        access_token: token,
        permissions,
      },
    });
    return res.status(200).json(dataRes);
  }

  @ApiTags('Auth Redirect UCMS')
  @Post('sso-ucms/refresh-token')
  @HttpCode(200)
  async reAuthSSO(@Req() req, @Response() res) {
    const fingerprint = req?.fp;
    const deviceId = fingerprint?.id;
    const refreshToken = req.cookies?.sso_ucms_refresh_token;
    const result = await this.deviceSessionService.reAuth(
      deviceId,
      refreshToken,
    );
    if (result.status_code === 200) {
      const { refresh_token, expired_at } = result;
      res.cookie('sso_ucms_refresh_token', refresh_token, {
        httpOnly: true,
        expires: new Date(expired_at),
        sameSite: 'Strict',
      });
    }
    return res.send(result);
  }
}
