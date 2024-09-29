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

@ApiTags('MFA')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UserService,
    private readonly authenticationService: AuthService,
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
  @UseGuards(JwtUserGuard)
  async register(@Body() data, @Res() response: Response, @Request() request) {
    const checkConsentToken =
      await this.authenticationService.verifyConsentToken(data?.consent_token);
    if (!checkConsentToken) {
      throw new UnauthorizedException('Consent token is invalid');
    }
    const dataGenerate =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        request.user,
      );

    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      dataGenerate?.data?.otpauthUrl,
    );
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
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
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
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(
        request.user.id,
        true,
      );

    request.res.setHeader('Set-Cookie', [accessTokenCookie]);

    return request.user;
  }
}
