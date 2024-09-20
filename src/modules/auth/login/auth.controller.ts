import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { LocalAuthGuard } from '../local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req, @Response() res, @Body() data: LoginRequestDto) {
    const token = await this.authService.login(req.user);
    return res.status(200).json(token);
  }

  @Post('login-ucms')
  @HttpCode(200)
  async loginUcms(@Request() req, @Response() res, @Body() data: LoginRequestDto) {
    const token = await this.authService.loginRedirectUCSM(data);
    return res.status(200).json(token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Request() req): Promise<any> {
    return req.user;
  }
}
