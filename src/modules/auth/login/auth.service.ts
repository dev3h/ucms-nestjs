import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUserCreds(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new UnprocessableEntityException({
        errors: {
          email: [
            this.i18n.t('message.email.not-found', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('message.email.not-found', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnprocessableEntityException({
        errors: {
          password: [
            this.i18n.t('auth.password', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('auth.password', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    return user;
  }

  generateToken(user: any) {
    return {
      access_token: this.jwtService.sign({
        name: user.name,
        sub: user.id,
      }),
    };
  }

  async login(data: any) {
    const user = await this.validateUserCreds(data.email, data.password);
    return this.generateToken(user);
  }
}
