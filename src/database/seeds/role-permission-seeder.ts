import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '@/modules/role/entities/role.entity';
import { System } from '@/modules/system/entities/system.entity';
import { Permission } from '@/modules/permission/entities/permission.entity';

export class RolePermissionSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    const roles = [
      { name: 'master_admin', code: 'SUPER_ADMIN' },
      { name: 'admin', code: 'ADMIN' },
      { name: 'user', code: 'USER' },
    ];

    // Create roles
    for (const roleData of roles) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
    }

    // Fetch systems with relations
    const systems = await dataSource.getRepository(System).find({
      relations: [
        'subsystems',
        'subsystems.modules',
        'subsystems.modules.actions',
      ],
    });

    // Create permissions based on system structure
    for (const system of systems) {
      for (const subsystem of system.subsystems) {
        for (const module of subsystem.modules) {
          for (const action of module.actions) {
            const permissionName = `${system.code}-${subsystem.code}-${module.code}-${action.code}`;
            const permission = permissionRepository.create({
              name: permissionName,
              code: permissionName,
            });
            await permissionRepository.save(permission);
          }
        }
      }
    }

    // Assign all permissions to the master_admin role
    const superAdminRole = await roleRepository.findOne({
      where: { name: 'master_admin' },
      relations: ['permissions'],
    });
    const allPermissions = await permissionRepository.find();
    if (superAdminRole) {
      superAdminRole.permissions = allPermissions;
      await roleRepository.save(superAdminRole);
    }

    // Assign all permissions to the user role
    const userRole = await roleRepository.findOne({
      where: { name: 'user' },
      relations: ['permissions'],
    });
    if (userRole) {
      userRole.permissions = allPermissions;
      await roleRepository.save(userRole);
    }
  }
}
