import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtUserStrategy } from '../strategy/jwt-user.strategy';

@Injectable()
export class JwtUserGuard extends AuthGuard('jwt-user') {
  constructor(private readonly jwtUserStrategy: JwtUserStrategy) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = await this.jwtUserStrategy.validate(token);
    request.user = payload;

    return payload !== null;
  }
}
