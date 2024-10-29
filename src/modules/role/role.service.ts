import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseUtil } from '@/utils/response-util';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { Permission } from '../permission/entities/permission.entity';
import { RestPermissionDto } from './dto/rest-permission.dto';
import { System } from '../system/entities/system.entity';
import { paginate } from '@/utils/pagination.util';
import { RoleDto } from './dto/role.dto';
import { RoleFilter } from './filters/role.filter';
import { BaseService } from '@/share/base-service/base.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    private readonly roleFilter: RoleFilter,
  ) {
    super(roleRepository);
  }

  async store(body) {
    try {
      await this.roleRepository.save(body);
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
      const query = this.roleRepository.createQueryBuilder('role');

      this.roleFilter.applyFilters(query);

      let formattedData;
      let meta = null;

      if (!request.query.noPagination) {
        const page = parseInt(request.query.page as string, 10) || 1;
        const limit = parseInt(request.query.limit as string, 10) || 10;
        const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
        const paginationResult = await paginate(query, page, limit, baseUrl);
        formattedData = RoleDto.mapFromEntities(paginationResult.data);
        meta = paginationResult.meta;
      } else {
        const data = await query.getMany();
        formattedData = RoleDto.mapFromEntities(data);
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

  findOne(id: number) {
    try {
      const role = this.roleRepository.findOne({
        where: { id },
      });
      return ResponseUtil.sendSuccessResponse({
        data: role,
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
      const role = this.roleRepository.findOne({
        where: { id },
      });
      if (!role) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      this.roleRepository.update(id, body);
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
      const role = await this.roleRepository.findOne({
        where: { id },
      });
      if (!role) {
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

  async restPermission(id: number) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions'],
      });
      if (!role) {
        return ResponseUtil.sendErrorResponse('Role not found', null);
      }

      const permissions = await this.permissionRepository.find();
      const permissionOfRole = role.permissions;
      const diffPermissions = permissions.filter(
        (permission) =>
          !permissionOfRole.some(
            (rolePermission) => rolePermission.id === permission.id,
          ),
      );
      console.log('diffPermissions', diffPermissions);
      const formattedData =
        diffPermissions?.length > 0
          ? await RestPermissionDto.toArray(
              diffPermissions,
              this.systemRepository,
            )
          : [];

      return ResponseUtil.sendSuccessResponse({ data: formattedData });
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
