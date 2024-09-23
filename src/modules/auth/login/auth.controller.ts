import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { LocalAuthGuard } from '../local-auth.guard';
import { EmailRequestDto } from '../dto/email.dto';
import { LoginSSOUCMSRequestDto } from '../dto/login-sso-ucms.dto';
import RequestWithUser from '../requestWithUser.interface';
import { UserService } from '@/modules/user/user.service';
import { ResponseUtil } from '@/utils/response-util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req, @Response() res, @Body() data: LoginRequestDto) {
    const token = await this.authService.login(req.user);
    const response = ResponseUtil.sendSuccessResponse({ data: token });
    return res.status(200).json(response);
  }

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

  @Post('check-email-exist')
  @HttpCode(200)
  async checkEmailExist(@Body() data: EmailRequestDto) {
    return this.authService.checkEmailExist(data.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Request() req): Promise<any> {
    return req.user;
  }
}
