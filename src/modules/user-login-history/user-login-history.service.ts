import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginHistory } from './user-login-history.entity';
import { ResponseUtil } from '@/utils/response-util';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';

@Injectable()
export class UserLoginHistoryService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(UserLoginHistory)
    private readonly loginHistoryRepository: Repository<UserLoginHistory>,
  ) {}

  // Lưu lại lịch sử đăng nhập
  async recordLogin(data: any) {
    try {
      const loginHistory = this.loginHistoryRepository.create({
        user_id: data.id,
        device_id: data.device_id,
        token: data.token,
      });
      return await this.loginHistoryRepository.save(loginHistory);
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  // Lấy lịch sử đăng nhập theo device_id
  async getLoginHistory(deviceId: string): Promise<UserLoginHistory[]> {
    return await this.loginHistoryRepository.find({
      where: { device_id: deviceId },
      relations: ['user'],
      order: { last_login: 'DESC' },
    });
  }

  // Tự động đăng nhập từ lịch sử đăng nhập
  async autoLoginFromHistory(data) {
    const loginHistory = await this.loginHistoryRepository.findOne({
      where: { user_id: data?.user_id, token: data?.token },
      relations: ['user'],
    });
    if (!loginHistory) {
      return ResponseUtil.sendErrorResponse(
        'Token not found',
        'TOKEN_NOT_FOUND',
      );
    }
    return loginHistory.user;
  }

  async generateDeviceId(res: Response): Promise<string> {
    let deviceId: string;
    do {
      deviceId = Math.random().toString(36).substring(2, 15);
      const loginHistory = await this.loginHistoryRepository.findOne({
        where: { device_id: deviceId },
      });
      if (!loginHistory) {
        // Lưu deviceId vào cookie
        res.cookie('deviceId', deviceId, {
          httpOnly: true,
          maxAge: 3 * 60 * 1000,
        }); // Cookie tồn tại trong 3 phút
        return deviceId;
      }
    } while (true);
  }
}
