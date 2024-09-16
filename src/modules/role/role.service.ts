import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseUtil } from '@/utils/response-util';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { Permission } from '../permission/entities/permission.entity';
import { RestPermissionDto } from './dto/rest-permission.dto';
import { System } from '../system/entities/system.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  findAll() {
    return `This action returns all role`;
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
