import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUserCreds(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        errors: { email: ['User not found'] },
        message: 'User not found',
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnprocessableEntityException({
        errors: { password: ['Invalid credentials'] },
        message: 'Invalid credentials',
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
