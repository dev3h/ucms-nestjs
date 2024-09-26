import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserStrategy } from '../strategy/user.strategy';

@Injectable()
export class UserGuard extends AuthGuard('user') {
  constructor(private readonly userStrategy: UserStrategy) {
    super();
  }
}
