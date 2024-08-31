import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '@/modules/role/entities/role.entity';
import { Permission } from '@/modules/permission/entities/permission.entity';
import { User } from '@/modules/user/user.entity';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const data = [
      {
        name: 'nam nd',
        email: 'namnd@yopmail.com',
        password: await bcrypt.hash('a12345678X', 10),
        isChangePasswordFirst: true,
      },
      {
        name: 'cuongdd',
        email: 'cuongdd@yopmail.com',
        password: await bcrypt.hash('a12345678X', 10),
        isChangePasswordFirst: true,
      },
    ];

    for (const item of data) {
      const user = await userRepository.save(userRepository.create(item));
      await this.assignRole(user, 'master_admin', dataSource);
    }
  }

  private async assignRole(
    user: User,
    roleName: string,
    dataSource: DataSource,
  ): Promise<void> {
    const roleRepository = dataSource.getRepository(Role); // Use the Role entity
    const permissionRepository = dataSource.getRepository(Permission); // Use the Permission entity

    const role = await roleRepository.findOne({ where: { name: roleName } });
    if (role) {
      user.roles = [role];
      await dataSource.manager.save(user);

      const permissions = await permissionRepository.find({
        where: { roles: { id: role.id } },
      });
      user.permissions = permissions;
      await dataSource.manager.save(user);
    }
  }
}
