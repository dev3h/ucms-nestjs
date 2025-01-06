import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';
import { System } from '../system/entities/system.entity';
import { User } from '../user/user.entity';
import { Role } from '../role/entities/role.entity';
import { ResponseUtil } from '@/utils/response-util';

@Injectable()
export class DashboardService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}
  async getStatistic(body) {
    const totalUsers = await this.usersRepository.count();
    const totalSystems = await this.systemsRepository.count();
    const totalRoles = await this.rolesRepository.count();
    const data = {
      totalUsers,
      totalSystems,
      totalRoles,
    };
    return ResponseUtil.sendSuccessResponse({ data });
  }
}
