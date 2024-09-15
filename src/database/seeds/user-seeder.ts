import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '@/modules/role/entities/role.entity';
import { Permission } from '@/modules/permission/entities/permission.entity';
import { User } from '@/modules/user/user.entity';
import { UserHasPermission } from '@/modules/user/user-has-permission.entity';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const data = [
      {
        name: 'nam nd',
        email: 'namnd@yopmail.com',
        password: 'a12345678X',
        is_change_password_first: true,
        role: 'master_admin',
      },
      {
        name: 'cuongdd',
        email: 'cuongdd@yopmail.com',
        password: 'a12345678X',
        is_change_password_first: false,
        role: 'user',
      },
    ];

    for (const item of data) {
      const { role, ...userData } = item;
      const user = await userRepository.save(userRepository.create(userData));
      await this.assignRole(user, role, dataSource);
    }
  }

  private async assignRole(
    user: User,
    roleName: string,
    dataSource: DataSource,
  ): Promise<void> {
    const roleRepository = dataSource.getRepository(Role); // Use the Role entity
    const permissionRepository = dataSource.getRepository(Permission); // Use the Permission entity
    const userHasPermissionRepository =
      dataSource.getRepository(UserHasPermission); // Use the UserHasPermission entity

    const role = await roleRepository.findOne({ where: { name: roleName } });
    if (role) {
      user.roles = [role];
      await dataSource.manager.save(user);

      const permissions = await permissionRepository.find({
        where: { roles: { id: role.id } },
      });

      const userHasPermissions = permissions.map((permission) => {
        const userHasPermission = new UserHasPermission();
        userHasPermission.user = user;
        userHasPermission.permission = permission;
        return userHasPermission;
      });

      await userHasPermissionRepository.save(userHasPermissions);
    }
  }
}
