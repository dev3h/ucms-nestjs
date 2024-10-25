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
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from '../dto/login.dto';
import { EmailRequestDto } from '../dto/email.dto';
import { ResponseUtil } from '@/utils/response-util';
import { UserTypeEnum } from '@/modules/user/enums/user-type.enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  @Post('admin/login')
  @HttpCode(200)
  async adminLogin(
    @Body() data: LoginRequestDto,
    @Response() res,
    @I18n() i18n: I18nContext,
  ) {
    const admin = await this.authService.validateUserCreds(
      data?.email,
      data?.password,
    );
    if (admin?.type !== UserTypeEnum.ADMIN) {
      return ResponseUtil.sendErrorResponse(
        i18n.t('message.not-admin-account'),
        'NOT_ADMIN_ACCOUNT',
      );
    }
    const token = await this.authService.createAdminToken(admin);
    const dataRes = ResponseUtil.sendSuccessResponse({
      data: {
        access_token: token,
      },
    });
    return res.status(200).json(dataRes);
  }
  @ApiTags('Auth')
  @Get('/admin/me')
  async getAdmin(@Req() req, @Response() res) {
    const token = req.headers.authorization?.split(' ')?.[1];
    const decodedToken = await this.authService.verifyToken(token);
    const dataRes = ResponseUtil.sendSuccessResponse({
      data: decodedToken,
    });
    return res.status(200).json(dataRes);
  }

  @ApiTags('Auth')
  @Post('admin/logout')
  async logout(@Req() req, @Response() res) {
    const token = req.headers.authorization.split(' ')?.[1];
    const decodedToken = await this.authService.verifyToken(token);
    await this.authService.logout(decodedToken.jti);
    return res.status(200).json({ message: 'Successfully logged out' });
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
  async confirmSSO_UCMS(
    @Req() request: Request,
    @Body() data,
    @Response() res,
  ) {
    const deviceId = request.cookies?.deviceId;
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
  async getTokenSSO_UCMS(@Body() data, @Response() res) {
    const response = await this.authService.getSSO_Token_UCMS(data);
    const dataRes = ResponseUtil.sendSuccessResponse(response);
    return res.status(200).json(dataRes);
  }

  @ApiTags('Auth Redirect UCMS')
  @Post('sso-ucms/me')
  async meSSO_UCMS(@Body() body, @Req() req, @Res() res) {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = await this.authService.verifyToken(token);

    const permissions = await this.authService.getPermissionsForSystem(
      decodedToken.id,
      body.client_id,
      body.client_secret,
    );

    const dataRes = ResponseUtil.sendSuccessResponse({
      data: {
        ...decodedToken,
        permissions,
      },
    });
    return res.status(200).json(dataRes);
  }
}
