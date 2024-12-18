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
import { I18nService } from 'nestjs-i18n';

@ApiTags('MFA')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UserService,
    private readonly authenticationService: AuthService,
    private readonly i18n: I18nService,
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
    user.save();
    delete data?.totpCode;
    return ResponseUtil.sendSuccessResponse({ data });
  }

  @Post('challenge')
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
}
