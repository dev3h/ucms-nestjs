import { Injectable } from '@nestjs/common';
import { UserRegisterRequestDto } from './dto/user-register.req.dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Request } from 'express';
import { UserFilter } from './filters/user.filter';
import { ResponseUtil } from '@/utils/response-util';
import { paginate } from '@/utils/pagination.util';
import { UserDto } from './dto/user.dto';
import { UserPermissionFilter } from './filters/user-permission.filter';
import { UserPermissionDto } from './dto/user-permission.dto';
import { Permission } from '../permission/entities/permission.entity';
import { UserHasPermission } from './user-has-permission.entity';
import { Role } from '../role/entities/role.entity';
import { UserPermissionStatusEnum } from './enums/user-permission-status.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(UserHasPermission)
    private readonly userPermission: Repository<UserHasPermission>,
    @InjectRepository(Role)
    private readonly userPermissionFilter: UserPermissionFilter,
    private readonly userFilter: UserFilter,
  ) {}

  async doUserRegistration(
    userRegister: UserRegisterRequestDto,
  ): Promise<User> {
    const user = new User();
    user.name = userRegister.name;
    user.email = userRegister.email;
    user.password = userRegister.password;

    return await user.save();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ where: { email } });
  }

  async getUserById(id: number): Promise<User | undefined> {
    return User.findOne({ where: { id } });
  }

  async create(body) {
    try {
      const system = this.userRepository.create(body);

      await this.userRepository.save(system);
      return ResponseUtil.sendSuccessResponse(null, 'Created successfully');
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  async findAll(request: Request) {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role');

      this.userFilter.applyFilters(query);

      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 10;
      const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
      const paginationResult = await paginate(query, page, limit, baseUrl);

      const formattedData = UserDto.mapFromEntities(paginationResult.data);
      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
        meta: paginationResult.meta,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  async getAllPermissionsOfUser(userId: number, request: Request) {
    try {
      // Fetch user with roles and permissions
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .leftJoinAndSelect('role.permissions', 'rolePermission')
        .leftJoinAndSelect('user.userHasPermissions', 'userHasPermission')
        .leftJoinAndSelect('userHasPermission.permission', 'directPermission')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user) {
        return ResponseUtil.sendErrorResponse('User not found');
      }

      // Combine role permissions and direct permissions
      const rolePermissions = user.roles.reduce((acc, role) => {
        return [...acc, ...role.permissions];
      }, []);

      const directPermissions = user.userHasPermissions
        .filter((userHasPermission) => userHasPermission.is_direct)
        .map((userHasPermission) => userHasPermission.permission);

      const ignoredPermissions = user.userHasPermissions
        .filter(
          (userHasPermission) =>
            !userHasPermission.is_direct &&
            userHasPermission.status === UserPermissionStatusEnum.IGNORED,
        )
        .map((userHasPermission) => userHasPermission.permission);

      // Calculate final permissions
      const allPermissions = [...rolePermissions, ...directPermissions];
      const finalPermissions = allPermissions.filter(
        (permission) =>
          !ignoredPermissions.some((ignored) => ignored.id === permission.id),
      );
      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 10;
      const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
      // Check if finalPermissions is empty
      if (finalPermissions.length === 0) {
        return ResponseUtil.sendSuccessResponse({
          data: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: limit,
            totalPages: 0,
            currentPage: page,
          },
        });
      }

      // Apply filters using UserPermissionFilter
      const permissionsQuery = this.permissionsRepository
        .createQueryBuilder('permission')
        .where('permission.id IN (:...permissionIds)', {
          permissionIds: finalPermissions.map((permission) => permission.id),
        });

      // this.userPermissionFilter.applyFilters(permissionsQuery);

      // Pagination

      const paginationResult = await paginate(
        permissionsQuery,
        page,
        limit,
        baseUrl,
      );

      // Format permissions using UserPermissionDto
      const formattedPermissions = UserPermissionDto.mapFromEntities(
        paginationResult.data,
      );

      return ResponseUtil.sendSuccessResponse({
        data: formattedPermissions,
        meta: paginationResult.meta,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  async getAvailablePermissionsForUser(userId: number): Promise<Permission[]> {
    // 1. Lấy tất cả các role của user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'], // Load các roles và permissions của roles
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Lấy danh sách quyền từ tất cả các role của user
    const rolePermissions = user.roles.flatMap((role) => role.permissions);

    // 3. Lấy danh sách quyền được gán trực tiếp và bị ignore của user
    const userPermissions = await this.userPermission.find({
      where: { user: { id: userId } },
      relations: ['permission'],
    });

    const directPermissions = userPermissions
      .filter((userPermission) => userPermission.is_direct)
      .map((userPermission) => userPermission.permission);

    const ignoredPermissions = userPermissions
      .filter((userPermission) => userPermission.status === 0) // 0 là ignore
      .map((userPermission) => userPermission.permission);

    // 4. Tổng hợp danh sách quyền đã có (bao gồm từ roles, quyền trực tiếp, và bị ignore)
    const existingPermissionIds = new Set([
      ...rolePermissions.map((perm) => perm.id),
      ...directPermissions.map((perm) => perm.id),
      ...ignoredPermissions.map((perm) => perm.id),
    ]);

    // 5. Lấy danh sách quyền chưa có (không nằm trong existingPermissionIds)
    const availablePermissions = await this.permissionsRepository.find({
      where: { id: Not(In([...existingPermissionIds])) },
    });

    return availablePermissions;
  }

  findOne(id: number) {
    return `This action returns a #${id} system`;
  }

  update(id: number, body) {
    return `This action updates a #${id} system`;
  }

  remove(id: number) {
    return `This action removes a #${id} system`;
  }
}
