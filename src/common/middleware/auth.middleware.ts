import { AuthService } from '@/modules/auth/login/auth.service';
import { UserService } from '@/modules/user/user.service';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Lấy token từ header Authorization
      const uaParser = new UAParser(req.headers['user-agent']);
      const browser = uaParser.getBrowser().name;
      const os = uaParser.getOS().name;
      const token = req.headers.authorization?.split(' ')?.[1];
      if (!token) {
        throw new UnauthorizedException('Token is missing');
      }
      // Lấy fingerprint từ request (nếu có)
      const deviceId = req?.cookies?.fp;
      if (!deviceId) {
        throw new UnauthorizedException('Device ID is missing');
      }

      const uid = req?.cookies?.uid;

      // Xác minh token
      const payload = await this.authService.verifyToken({
        token,
        deviceId,
        uid,
        browser,
        os,
      });
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      // Lấy thông tin người dùng
      const user = await this.userService.findOne(payload?.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Gắn thông tin người dùng vào request để sử dụng ở controller
      req['user'] = user;

      next(); // Cho phép tiếp tục nếu hợp lệ
    } catch (error) {
      next(error); // Ném lỗi nếu xảy ra
    }
  }
}
