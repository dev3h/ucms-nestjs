import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  Request,
  Response,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { EmailRequestDto } from '../dto/email.dto';
import { LoginSSOUCMSRequestDto } from '../dto/login-sso-ucms.dto';
import RequestWithUser from '../requestWithUser.interface';
import { UserService } from '@/modules/user/user.service';
import { ResponseUtil } from '@/utils/response-util';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiTags('Auth')
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req, @Response() res, @Body() data: LoginRequestDto) {
    const token = await this.authService.login(req.user);
    const response = ResponseUtil.sendSuccessResponse({ data: token });
    return res.status(200).json(response);
  }

  @ApiTags('Auth')
  @UseGuards(LocalAuthGuard)
  @Post('login-ucms')
  @HttpCode(200)
  async loginUcms(
    @Req() request: RequestWithUser,
    @Response() res,
    @Body() data: LoginSSOUCMSRequestDto,
  ) {
    try {
      const { user } = request;
      const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
        user.id,
      );
      const { cookie: refreshTokenCookie, token: refreshToken } =
        this.authService.getCookieWithJwtRefreshToken(user.id);

      await this.userService.setCurrentRefreshToken(refreshToken, user.id);

      request.res.setHeader('Set-Cookie', [
        accessTokenCookie,
        refreshTokenCookie,
      ]);

      if (user.two_factor_enable) {
        const data = {
          twoFactor: true,
        };
        return res.status(200).json({ data });
      }

      return user;
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
    // const token = await this.authService.loginWithUCSM(data);
    // return res.status(200).json(token);
  }

  @ApiTags('Auth')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Request() req): Promise<any> {
    return req.user;
  }

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
  async adminLogin(@Body() data: LoginRequestDto, @Response() res) {
    const admin = await this.authService.validateUserCreds(
      data.email,
      data.password,
    );
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = await this.authService.createAdminToken(admin);
    return res.json({ access_token: token });
  }
  @ApiTags('Auth')
  @Post('logout')
  async logout(@Req() req, @Response() res) {
    const token = req.headers.authorization.split(' ')[1];
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
  @ApiTags('Auth Redirect UCMS')
  @Post('check-email-exist')
  @HttpCode(200)
  async checkEmailExist(
    @Body() data: EmailRequestDto,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
  ) {
    console.log({ clientId, redirectUri });
    return this.authService.checkEmailExist(data.email);
  }
  @ApiTags('Auth Redirect UCMS')
  @Post('oauth/login')
  @HttpCode(200)
  async oauthLogin(@Body() data: LoginRequestDto, @Response() res) {
    const user = await this.authService.validateUserCreds(
      data.email,
      data.password,
    );
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = await this.authService.createUserToken(user);
    return res.json({ access_token: token });
  }
}
