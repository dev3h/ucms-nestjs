import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { PermissionDto } from './dto/permission.dto';
import { ResponseUtil } from '@/utils/response-util';
import { PermissionFilter } from './filters/permission.filter';
import { BaseService } from '@/share/base-service/base.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PermissionService extends BaseService<Permission> {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly permissionFilter: PermissionFilter,
  ) {
    super(permissionRepository);
  }
  async store(body) {
    try {
      await this.permissionRepository.save(body);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Created-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async findAll(request: Request) {
    try {
      const query = this.permissionRepository.createQueryBuilder('permission');

      this.permissionFilter.applyFilters(query);

      let formattedData;
      let meta = null;

      if (!request.query.noPagination) {
        const page = parseInt(request.query.page as string, 10) || 1;
        const limit = parseInt(request.query.limit as string, 10) || 10;
        const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
        const paginationResult = await paginate(query, page, limit, baseUrl);
        formattedData = PermissionDto.mapFromEntities(paginationResult.data);
        meta = paginationResult.meta;
      } else {
        const data = await query.getMany();
        formattedData = PermissionDto.mapFromEntities(data);
      }

      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
        meta: meta,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async findOne(id: number) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id },
      });
      const formattedData = new PermissionDto(permission);
      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  update(id: number, body) {
    try {
      const permission = this.permissionRepository.findOne({
        where: { id },
      });
      if (!permission) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      this.permissionRepository.update(id, body);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Updated-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async remove(id: number) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id },
      });
      if (!permission) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      await this.softDelete(id);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Deleted-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }
}
