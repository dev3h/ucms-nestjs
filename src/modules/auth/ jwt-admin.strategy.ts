import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './login/auth.service';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ADMIN_SECRET || 'adminSecret',
    });
  }

  async validate(payload: any) {
    const isTokenBlacklisted = await this.authService.verifyToken(payload.jti);
    if (isTokenBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    // Xác thực admin
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Admin privileges required');
    }

    return payload;
  }
}
