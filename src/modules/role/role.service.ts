import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseUtil } from '@/utils/response-util';

@Injectable()
export class RoleService {
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
      const role = await this.roleRepository.findOne(id, {
        relations: ['permissions'],
      });
      if (!role) {
        throw new NotFoundException('Data not found');
      }

      const permissions = await this.permissionRepository.find();
      const permissionOfRole = role.permissions;
      const diffPermissions = permissions.filter(
        (permission) =>
          !permissionOfRole.some(
            (rolePermission) => rolePermission.id === permission.id,
          ),
      );

      return diffPermissions;
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }
}
