import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalStrategy } from '../strategy/local.strategy';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private readonly localStrategy: LocalStrategy) {
    super();
  }
}