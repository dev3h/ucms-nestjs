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

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    private readonly roleFilter: RoleFilter,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
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
        'Something went wrong',
        error.message,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
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
        'Something went wrong',
        error.message,
      );
    }
  }
}
