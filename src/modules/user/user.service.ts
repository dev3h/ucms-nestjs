import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

import { User } from './user.entity';
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
import { RestPermissionDto } from '../role/dto/rest-permission.dto';
import { System } from '../system/entities/system.entity';
import { MailService } from '@/mail/mail.service';
import { UserTypeEnum } from './enums/user-type.enum';
import { Utils } from '@/utils/utils';
import { I18nService } from 'nestjs-i18n';
import { Subsystem } from '../subsystem/entities/subsystem.entity';
import { Module } from '../module/entities/module.entity';
import { Action } from '../action/entities/action.entity';
import { UserDetailDto } from './dto/user-detail.dto';
import { SystemDetailDto } from '../system/dto/system-detail.dto';
import { JobService } from '../../job/job.service';

dotenv.config();

@Injectable()
export class UserService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserHasPermission)
    private readonly userPermissionRepository: Repository<UserHasPermission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly userPermissionFilter: UserPermissionFilter,
    private readonly userFilter: UserFilter,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    @InjectRepository(Subsystem)
    private readonly subsystemRepository: Repository<Subsystem>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => JobService))
    private readonly jobService: JobService,
    private readonly dataSource: DataSource,
  ) {}

  async getUserByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ where: { email } });
  }

  async getUserById(id: number): Promise<User | undefined> {
    return User.findOne({ where: { id } });
  }

  async store(body) {
    // const queryRunner =
    //   this.userRepository.manager.connection.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    try {
      // Tạo và lưu tài khoản
      const { role_id, ...userData } = body;
      const account = await this.userRepository.save(
        this.userRepository.create(userData),
      );
      const singleAccount = Array.isArray(account) ? account[0] : account;
      // Gán vai trò cho tài khoản
      const role = await this.roleRepository.findOne({
        where: { id: role_id },
      });
      if (role) {
        singleAccount.roles = [role];
        await this.userRepository.save(account);

        // Lấy các quyền của vai trò và gán cho tài khoản
        const permissions = await this.permissionRepository.find({
          where: { roles: { id: role.id } },
        });

        const userHasPermissions = permissions.map((permission) => {
          const userPermission = new UserHasPermission();
          userPermission.user = Array.isArray(account) ? account[0] : account;
          userPermission.permission = permission;
          return userPermission;
        });

        await this.userPermissionRepository.save(userHasPermissions);
      }
      // Commit transaction
      // await queryRunner.commitTransaction();

      const dataSend = {
        name: singleAccount?.name,
        email: singleAccount?.email,
        created_at: Utils.formatDate(singleAccount?.created_at?.toISOString()),
        password: body?.password,
      };
      if (singleAccount.type === UserTypeEnum.ADMIN) {
        const loginUrl = `${process.env.FRONTEND_URL}/admin/login`;
        dataSend['loginUrl'] = loginUrl;
        await this.mailService.addSendMailJob(dataSend);
        if (
          singleAccount.two_factor_enable &&
          !singleAccount.two_factor_confirmed_at
        ) {
          const twoFactorAuthSetupUrl = `${process.env.FRONTEND_URL}/admin/login/verify-account`;
          const data = {
            email: singleAccount?.email,
            name: singleAccount?.name,
            twoFactorAuthSetupUrl,
          };
          await this.mailService.addSendReset2FAMailJob(data);
        }
      } else {
        await this.mailService.addSendMailJob(dataSend);
      }
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Created-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      // await queryRunner.rollbackTransaction();
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
    // finally {
    //   await queryRunner.release();
    // }
  }

  async findAll(request: Request) {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role');

      this.userFilter.applyFilters(query);

      query.orderBy('user.created_at', 'DESC');
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
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getDeviceSessions(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['deviceSessions'],
      });

      if (!user) {
        return ResponseUtil.sendErrorResponse('User not found');
      }

      return ResponseUtil.sendSuccessResponse({
        data: user.deviceSessions.map((session) => ({
          ...session,
          geo_location: session.geo_location,
        })),
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
      const permissionsQuery = this.permissionRepository
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
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getPermissionsOfUser(userId: number, request: Request) {
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

      // Format permissions using UserPermissionDto
      const treeData =
        await this.transformPermissionsToTreeData(finalPermissions);
      return ResponseUtil.sendSuccessResponse({ data: treeData });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getAvailablePermissionsForUser(userId: number) {
    try {
      // 1. Lấy tất cả các role của user
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'], // Load các roles và permissions của roles
      });

      if (!user) {
        return ResponseUtil.sendErrorResponse('User not found');
      }

      // 2. Lấy danh sách quyền từ tất cả các role của user
      const rolePermissions = user.roles.flatMap((role) => role.permissions);

      // 3. Lấy danh sách quyền được gán trực tiếp và bị ignore của user
      const userPermissions = await this.userPermissionRepository.find({
        where: { user: { id: userId } },
        relations: ['permission'],
      });

      const directPermissions = userPermissions
        .filter((userPermission) => userPermission.is_direct)
        .map((userPermission) => userPermission.permission);

      const ignoredPermissions = userPermissions
        .filter(
          (userPermission) =>
            userPermission.status === UserPermissionStatusEnum.IGNORED,
        )
        .map((userPermission) => userPermission.permission);

      // 4. Tổng hợp danh sách quyền đã có (bao gồm từ roles, quyền trực tiếp, và bị ignore)
      const existingPermissionIds = new Set([
        ...rolePermissions.map((perm) => perm.id),
        ...directPermissions.map((perm) => perm.id),
        ...ignoredPermissions.map((perm) => perm.id),
      ]);

      // 5. Lấy danh sách quyền chưa có (không nằm trong existingPermissionIds)
      const availablePermissions = await this.permissionRepository.find({
        where: { id: Not(In([...existingPermissionIds])) },
      });
      const formattedData =
        availablePermissions?.length > 0
          ? await RestPermissionDto.toArray(
              availablePermissions,
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

  private async transformPermissionsToTreeData(
    permissions: Permission[],
  ): Promise<any[]> {
    const treeData = [];

    for (const permission of permissions) {
      const [systemCode, subsystemCode, moduleCode, actionCode] =
        permission.code.split('-');

      // Fetch system details
      let system = treeData.find((item) => item.code === systemCode);
      if (!system) {
        const systemDetails = await this.systemRepository.findOne({
          where: { code: systemCode },
        });
        system = {
          id: systemDetails?.id,
          name: systemDetails?.name,
          code: systemCode,
          subsystems: [],
        };
        treeData.push(system);
      }

      // Fetch subsystem details
      let subsystem = system.subsystems.find(
        (item) => item.code === subsystemCode,
      );
      if (!subsystem) {
        const subsystemDetails = await this.subsystemRepository.findOne({
          where: { code: subsystemCode },
        });
        subsystem = {
          id: subsystemDetails.id,
          name: subsystemDetails.name,
          code: subsystemCode,
          modules: [],
        };
        system.subsystems.push(subsystem);
      }

      // Fetch module details
      let module = subsystem.modules.find((item) => item.code === moduleCode);
      if (!module) {
        const moduleDetails = await this.moduleRepository.findOne({
          where: { code: moduleCode },
        });
        module = {
          id: moduleDetails.id,
          name: moduleDetails.name,
          code: moduleCode,
          actions: [],
        };
        subsystem.modules.push(module);
      }

      // Fetch action details
      let action = module.actions.find((item) => item.code === actionCode);
      if (!action) {
        const actionDetails = await this.actionRepository.findOne({
          where: { code: actionCode },
        });
        action = {
          id: actionDetails.id,
          name: actionDetails.name,
          code: actionCode,
          granted: false,
        };
        module.actions.push(action);
      }
    }

    return treeData;
  }

  // TEST FUNCTION
  async getPermissionsForUser(userId: number) {
    try {
      // 1. Lấy tất cả các role của user
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        return ResponseUtil.sendErrorResponse('User not found');
      }

      // 2. Lấy danh sách quyền trực tiếp và bị ignore của user
      const userPermissions = await this.userPermissionRepository.find({
        where: { user: { id: userId } },
        relations: ['permission'],
      });

      const directPermissionCodes = new Set(
        userPermissions
          .filter((userPermission) => userPermission.is_direct)
          .map((userPermission) => userPermission.permission.code),
      );

      const ignoredPermissionCodes = new Set(
        userPermissions
          .filter(
            (userPermission) =>
              userPermission.status === UserPermissionStatusEnum.IGNORED,
          )
          .map((userPermission) => userPermission.permission.code),
      );

      // 3. Lấy tất cả cây permission từ system -> subsystem -> module -> action
      const allSystems = await this.systemRepository.find({
        relations: [
          'subsystems',
          'subsystems.modules',
          'subsystems.modules.actions',
        ],
      });
      const filteredSystems = allSystems?.filter((system) =>
        system?.subsystems?.some((subsystem) =>
          subsystem?.modules?.some((module) => module?.actions?.length > 0),
        ),
      );

      const permissionTree = SystemDetailDto.mapFromEntities(filteredSystems);

      // 4. Kiểm tra và set grant cho mỗi permission dựa trên direct, ignored, và role permissions
      const rolePermissions = new Set(
        user.roles.flatMap((role) => role.permissions.map((perm) => perm.code)),
      );

      for (const system of permissionTree) {
        for (const subsystem of system.subsystems) {
          for (const module of subsystem.modules) {
            for (const action of module.actions) {
              // Tạo actionCode bằng cách nối các code từ system, subsystem, module và action
              const actionCode = `${system.code}-${subsystem.code}-${module.code}-${action.code}`;

              // Tìm trong UserHasPermission bằng actionCode
              const userPermission =
                await this.userPermissionRepository.findOne({
                  where: {
                    user: { id: user.id },
                    permission: { code: actionCode },
                  },
                });
              action.is_direct = userPermission?.is_direct;
              action.status = userPermission?.status;

              if (ignoredPermissionCodes.has(actionCode)) {
                // Nếu permission bị ignore thì grant = false
                action.granted = false;
              } else if (directPermissionCodes.has(actionCode)) {
                // Nếu là direct permission thì grant = true
                action.granted = true;
              } else if (rolePermissions.has(actionCode)) {
                // Nếu có trong role permissions thì grant = true
                action.granted = true;
              } else {
                // Nếu không có trong direct hoặc role, thì grant = false
                action.granted = false;
              }
            }
          }
        }
      }

      // 5. Trả về tree permission với trạng thái granted
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

  async getPermissionsFromUserRoles(userId: number) {
    try {
      // Get the user with their roles and the permissions of those roles
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        return ResponseUtil.sendErrorResponse('User not found');
      }

      // Collect permissions from the roles assigned to the user
      const permissions = user.roles.flatMap((role) => role.permissions);

      // Remove duplicates by using a Set
      const uniquePermissions = Array.from(
        new Set(permissions.map((p) => p.id)),
      ).map((id) => permissions.find((p) => p.id === id));

      return ResponseUtil.sendSuccessResponse({ data: uniquePermissions });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async addPermissionsToUser(userId: number, permissionIds: number[]) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userHasPermissions'],
      });

      if (!user) {
        return ResponseUtil.sendErrorResponse('User not found');
      }

      // Get the permissions to be added based on the provided IDs
      const permissionsToAdd = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
      });

      for (const permission of permissionsToAdd) {
        // Check if the permission is already associated with the user
        const existingUserPermission = user.userHasPermissions.find((up) => {
          return up.id === permission.id;
        });
        console.log(!existingUserPermission);

        if (!existingUserPermission) {
          await this.userPermissionRepository.save({
            user,
            permission,
            is_direct: true,
            status: UserPermissionStatusEnum.ADDED,
          });
        }
      }
      return ResponseUtil.sendSuccessResponse(null, 'Permissions added');
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async ignorePermissions(
    userId: number,
    permissionIds: number[],
    removePermissionIgnoreIds: number[],
  ) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userHasPermissions'],
      });

      if (!user) {
        return ResponseUtil.sendErrorResponse('User not found');
      }

      if (permissionIds.length > 0) {
        const userPermissions = await this.userPermissionRepository.find({
          where: {
            user: { id: userId },
            permission: { id: In(permissionIds) },
          },
        });

        for (const userPermission of userPermissions) {
          userPermission.status = UserPermissionStatusEnum.IGNORED; // Mark as ignored
          await this.userPermissionRepository.save(userPermission);
        }
      }

      // Remove ignore status (set is_direct to 0)
      if (removePermissionIgnoreIds.length > 0) {
        const userPermissions = await this.userPermissionRepository.find({
          where: {
            user: { id: userId },
            permission: { id: In(removePermissionIgnoreIds) },
          },
        });

        for (const userPermission of userPermissions) {
          userPermission.status = null;
          await this.userPermissionRepository.save(userPermission);
        }
      }

      return ResponseUtil.sendSuccessResponse(
        null,
        'Permissions ignore successfully',
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

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      });
      if (!user) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      } else {
        const formattedData = new UserDetailDto(user);
        return ResponseUtil.sendSuccessResponse({ data: formattedData });
      }
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
      const { role_id, ...userData } = body;
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      // if (!userData?.two_factor_enable) {
      //   userData.two_factor_secret = null;
      //   userData.two_factor_confirmed_at = null;
      // }
      await this.userRepository.update(id, userData);

      const account = await this.userRepository.findOne({ where: { id } });
      if (
        account.two_factor_enable &&
        account.two_factor_enable !== user.two_factor_enable
      ) {
        const twoFactorAuthSetupUrl = `${process.env.FRONTEND_URL}/admin/login/verify-account`;
        const data = {
          email: user?.email,
          name: user?.name,
          twoFactorAuthSetupUrl,
        };
        await this.mailService.addSendReset2FAMailJob(data);
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
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }

      user.deleted_at = new Date();
      await this.userRepository.save(user);

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

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.userRepository.update(userId, {
      two_factor_secret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.userRepository.update(userId, {
      two_factor_enable: true,
    });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refresh_token: currentHashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getUserById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async updatePermission(userId: number, body) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userHasPermissions'],
    });

    if (!user) {
      return ResponseUtil.sendErrorResponse('User not found');
    }
    const permissionAction = [];
    if (body?.length > 0) {
      for (const system of body) {
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
          const userPermission = await this.userPermissionRepository.findOne({
            where: { user: { id: userId }, permission: { id: permission.id } },
          });
          if (!userPermission) {
            await this.userPermissionRepository.save({
              user,
              permission,
              is_direct: true,
              status: UserPermissionStatusEnum.ADDED,
            });
          } else {
            if (userPermission?.is_direct) {
              if (!action?.granted) {
                await this.userPermissionRepository.delete(userPermission.id);
              }
            } else {
              if (action?.granted) {
                userPermission.status = null;
                await this.userPermissionRepository.save(userPermission);
              } else {
                userPermission.status = UserPermissionStatusEnum.IGNORED;
                await this.userPermissionRepository.save(userPermission);
              }
            }
          }
        }
      }

      // const userPermissions = await this.userPermissionRepository.find({
      //   where: {
      //     user: { id: userId },
      //     permission: { id: In(permissionIds) },
      //   },
      // });

      // for (const userPermission of userPermissions) {
      //   userPermission.status = UserPermissionStatusEnum.ADDED;
      //   await this.userPermissionRepository.save(userPermission);
      // }

      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Updated-successfully', {
          lang: 'vi',
        }),
      );
    }
  }

  async importCsv(body) {
    const file = body?.file;
    if (!file) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.file-not-found', { lang: 'vi' }),
        'FILE_NOT_FOUND',
      );
    }
    if (file.mimetype !== 'text/csv') {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-file-type-csv', { lang: 'vi' }),
        'INVALID_FILE_TYPE',
      );
    }
    const stream = Readable.from(file.buffer.toString());
    const results = [];

    try {
      await new Promise((resolve, reject) => {
        let headersChecked = false;
        stream
          .pipe(csvParser({ headers: true }))
          .on('data', (data) => {
            if (!headersChecked) {
              const requiredHeaders = [
                'name',
                'email',
                'phone_number',
                'password',
                'role_id',
                'type',
                'two_factor_enable',
              ];
              const fileHeaders = Object.values(data);
              const missingHeaders = requiredHeaders.filter(
                (header) => !fileHeaders.includes(header),
              );
              if (missingHeaders.length > 0) {
                reject(
                  new Error(
                    `Thiếu các tiêu đề bắt buộc: ${missingHeaders.join(', ')}`,
                  ),
                );
                return;
              }
              headersChecked = true;
            }
            results.push(data);
          })
          .on('end', resolve)
          .on('error', reject);
      });

      const formattedData = this.formatData(results);
      return ResponseUtil.sendSuccessResponse(
        { data: formattedData },
        'Imported successfully',
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        error.message ||
          this.i18n.t('message.Something-went-wrong', {
            lang: 'vi',
          }),
        'INVALID_HEADERS',
      );
    }
  }

  formatData(dataCsv) {
    const header = Object.values(dataCsv[0]);
    const data = dataCsv.slice(1);
    return data.map((item) => {
      const obj = {};
      header.forEach((key: any, index) => {
        obj[key] = (item as any)[`_${index}`];
      });
      return obj;
    });
  }

  async createMulti(data) {
    if (data.length <= 100) {
      return this.createDirectly(data);
    } else {
      return this.enqueueJob(data);
    }
  }

  async createDirectly(data) {
    let repository = this.userRepository;

    if (!repository) {
      repository = User.getRepository();
    }
    const queryRunner = repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result = [];
    try {
      for (const item of data) {
        const { role_id, ...userData } = item;
        try {
          const existingUser = await this.userRepository.findOne({
            where: { email: userData?.email },
          });
          if (existingUser) {
            result.push({
              ...item,
              importMessage: 'Email đã tồn tại',
              importStatus: 'failure',
            });
            continue;
          }

          const account = await this.userRepository.save(
            this.userRepository.create(userData),
          );
          const singleAccount = Array.isArray(account) ? account[0] : account;
          const role = await this.roleRepository.findOne({
            where: { id: role_id },
          });
          if (role) {
            singleAccount.roles = [role];
            await this.userRepository.save(account);

            const permissions = await this.permissionRepository.find({
              where: { roles: { id: role.id } },
            });

            const userHasPermissions = permissions.map((permission) => {
              const userPermission = new UserHasPermission();
              userPermission.user = Array.isArray(account)
                ? account[0]
                : account;
              userPermission.permission = permission;
              return userPermission;
            });

            await this.userPermissionRepository.save(userHasPermissions);
          }
          const dataSend = {
            name: singleAccount?.name,
            email: singleAccount?.email,
            created_at: Utils.formatDate(
              singleAccount?.created_at?.toISOString(),
            ),
            password: item?.password,
          };
          if (singleAccount.type === UserTypeEnum.ADMIN) {
            const loginUrl = `${process.env.FRONTEND_URL}/admin/login`;
            dataSend['loginUrl'] = loginUrl;
            await this.mailService.addSendMailJob(dataSend);
          } else {
            await this.mailService.addSendMailJob(dataSend);
          }
          result.push({
            ...item,
            importMessage: 'Created successfully',
            importStatus: 'success',
          });
        } catch (itemError) {
          result.push({
            ...item,
            importMessage: itemError.message,
            importStatus: 'failure',
          });
        }
      }
      await queryRunner.commitTransaction();
      return ResponseUtil.sendSuccessResponse(
        { data: result },
        this.i18n.t('message.Created-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async enqueueJob(data) {
    try {
      // Sử dụng một job queue (như Bull hoặc BeeQueue) để xử lý dữ liệu
      await this.jobService.addHandleImportUsersJob(data);
      return ResponseUtil.sendSuccessResponse(
        { data: null },
        this.i18n.t('message.Job-enqueued', { lang: 'vi' }),
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
