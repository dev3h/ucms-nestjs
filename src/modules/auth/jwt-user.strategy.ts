import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './login/auth.service';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_USER_SECRET || 'userSecret',
    });
  }

  async validate(payload: any) {
    const isTokenBlacklisted = await this.authService.verifyToken(payload.jti);
    if (isTokenBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    // Xác thực user
    if (payload.role !== 'user') {
      throw new UnauthorizedException('User privileges required');
    }

    return payload;
  }
}
