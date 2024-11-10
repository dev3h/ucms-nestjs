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
import { SystemDetailDto } from '../system/dto/system-detail.dto';

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
      const { permissions: permSystems, ...restBody } = body;
      const role = await this.roleRepository.save(
        this.roleRepository.create(restBody),
      );
      const singleRole = Array.isArray(role) ? role[0] : role;

      const permissionAction = [];
      if (permSystems?.length > 0) {
        for (const system of permSystems) {
          for (const subsystem of system.subsystems) {
            for (const module of subsystem.modules) {
              for (const action of module.actions) {
                permissionAction.push(action);
              }
            }
          }
        }
        if (permissionAction.length > 0) {
          for (const action of permissionAction) {
            if (action?.granted) {
              const permission = await this.permissionRepository.findOne({
                where: { code: action.permission_code },
              });
              if (!permission) {
                return ResponseUtil.sendErrorResponse('Permission not found');
              }
              await this.roleRepository
                .createQueryBuilder()
                .relation(Role, 'permissions')
                .of(singleRole)
                .add(permission);
            }
          }
        }
      }
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
      const query = this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .leftJoinAndSelect('role.users', 'users');

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

  async findOne(id: number) {
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
      const formattedData = new RoleDto(role);
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

  async update(id: number, body) {
    try {
      const { permissions: rolePermissions, ...restBody } = body;
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions'],
      });
      if (!role) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      await this.roleRepository.update(id, restBody);
      const permissionAction = [];
      for (const system of rolePermissions) {
        for (const subsystem of system.subsystems) {
          for (const module of subsystem.modules) {
            for (const action of module.actions) {
              permissionAction.push(action);
            }
          }
        }
      }
      if (permissionAction.length > 0) {
        for (const action of permissionAction) {
          const permission = await this.permissionRepository.findOne({
            where: { code: action.permission_code },
          });
          if (!permission) {
            return ResponseUtil.sendErrorResponse('Permission not found');
          }
          if (action?.granted) {
            const isExist = role.permissions.some(
              (rolePermission) => rolePermission.id === permission.id,
            );
            if (!isExist) {
              await this.roleRepository
                .createQueryBuilder()
                .relation(Role, 'permissions')
                .of(role)
                .add(permission);
            }
          } else {
            const isExist = role.permissions.some(
              (rolePermission) => rolePermission.id === permission.id,
            );
            if (isExist) {
              await this.roleRepository
                .createQueryBuilder()
                .relation(Role, 'permissions')
                .of(role)
                .remove(permission);
            }
          }
        }
      }
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
        relations: ['permissions'],
      });
      if (!role) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      await this.roleRepository
        .createQueryBuilder()
        .relation(Role, 'permissions')
        .of(role)
        .remove(role.permissions);
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

  async getPermissionTemplate() {
    try {
      const allSystems = await this.systemRepository.find({
        relations: [
          'subsystems',
          'subsystems.modules',
          'subsystems.modules.actions',
        ],
      });
      const permissionTree = SystemDetailDto.mapFromEntities(allSystems);
      return ResponseUtil.sendSuccessResponse({ data: permissionTree });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getPermissionsOfRole(roleId: number) {
    try {
      const role = await this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .where('role.id = :roleId', { roleId })
        .getOne();

      if (!role) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT-FOUND',
        );
      }

      const allSystems = await this.systemRepository.find({
        relations: [
          'subsystems',
          'subsystems.modules',
          'subsystems.modules.actions',
        ],
      });

      const permissionTree = SystemDetailDto.mapFromEntities(allSystems);

      for (const system of permissionTree) {
        for (const subsystem of system.subsystems) {
          for (const module of subsystem.modules) {
            for (const action of module.actions) {
              // Tạo actionCode bằng cách nối các code từ system, subsystem, module và action
              const actionCode = `${system.code}-${subsystem.code}-${module.code}-${action.code}`;

              const hasPermission = role.permissions.some(
                (permission) => permission.code === actionCode,
              );
              if (hasPermission) {
                action.granted = true;
              }
            }
          }
        }
      }

      return ResponseUtil.sendSuccessResponse({ data: permissionTree });
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
