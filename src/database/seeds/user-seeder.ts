import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '@/modules/role/entities/role.entity';
import { Permission } from '@/modules/permission/entities/permission.entity';
import { User } from '@/modules/user/user.entity';
import { UserHasPermission } from '@/modules/user/user-has-permission.entity';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const data = [
      {
        name: 'Nam ND',
        email: 'namnd@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'SUPER_ADMIN', // Updated role code
        type: 1,
        phone_number: '0332345678',
      },
      {
        name: 'Cuong DD',
        email: 'cuongdd@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'ADMIN', // Updated role code
        type: 2,
        phone_number: '0345673206',
      },
      {
        name: 'Thanh VT',
        email: 'thanhvt@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'TEACHER', // Updated role code
        type: 1,
        phone_number: '0123456789',
      },
      {
        name: 'Mai LT',
        email: 'mailt@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'STUDENT_AFFAIRS', // Updated role code
        type: 2,
        phone_number: '0987654321',
      },
      {
        name: 'Hoang PV',
        email: 'hoangpv@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'FINANCE_OFFICER', // Updated role code
        type: 1,
        phone_number: '0981234567',
      },
      {
        name: 'Kim TL',
        email: 'kimtl@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'DORMITORY_STAFF', // Updated role code
        type: 2,
        phone_number: '0976543210',
      },
      {
        name: 'Minh HT',
        email: 'minhht@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'TEACHER', // Updated role code
        type: 1,
        phone_number: '0912345678',
      },
      {
        name: 'Ly LD',
        email: 'lyld@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'STUDENT', // Updated role code
        type: 2,
        phone_number: '0901234567',
      },
      {
        name: 'Duong VD',
        email: 'duongvd@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'STUDENT', // Updated role code
        type: 1,
        phone_number: '0923456789',
      },
      {
        name: 'Nguyen TQ',
        email: 'nguyentq@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'STUDENT', // Updated role code
        type: 2,
        phone_number: '0932345678',
      },
      {
        name: 'Phan HT',
        email: 'phanht@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'ADMIN', // Updated role code
        type: 1,
        phone_number: '0912123456',
      },
      {
        name: 'Hieu CT',
        email: 'hieuct@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'FINANCE_OFFICER', // Updated role code
        type: 2,
        phone_number: '0945678901',
      },
      {
        name: 'Hien DM',
        email: 'hiendm@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'ADMIN', // Updated role code
        type: 1,
        phone_number: '0913216547',
      },
      {
        name: 'Tuan MA',
        email: 'tuanma@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'DORMITORY_STAFF', // Updated role code
        type: 2,
        phone_number: '0987654321',
      },
      {
        name: 'Chung DH',
        email: 'chungdh@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: true,
        role: 'STUDENT_AFFAIRS', // Updated role code
        type: 1,
        phone_number: '0913234567',
      },
      {
        name: 'Duc TH',
        email: 'ducth@yopmail.com',
        password: 'Nam@20020',
        is_change_password_first: false,
        role: 'TEACHER', // Updated role code
        type: 2,
        phone_number: '0945671234',
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
    roleCode: string, // Use roleCode instead of roleName
    dataSource: DataSource,
  ): Promise<void> {
    const roleRepository = dataSource.getRepository(Role); // Use the Role entity
    const permissionRepository = dataSource.getRepository(Permission); // Use the Permission entity
    const userHasPermissionRepository =
      dataSource.getRepository(UserHasPermission); // Use the UserHasPermission entity

    const role = await roleRepository.findOne({ where: { code: roleCode } }); // Search by role code
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
