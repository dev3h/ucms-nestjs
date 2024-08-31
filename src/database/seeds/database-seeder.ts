import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserSeeder } from './user-seeder';
import { RolePermissionSeeder } from './role-permission-seeder';
import { ActionSeeder } from './action-seeder';
import { ModuleSeeder } from './module-seeder';
import { SubSystemSeeder } from './subsystem-seeder';
import { SystemSeeder } from './system-seeder';

export class DatabaseSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const systemSeeder = new SystemSeeder();
    const subsystemSeeder = new SubSystemSeeder();
    const moduleSeeder = new ModuleSeeder();
    const actionSeeder = new ActionSeeder();
    const rolePermissionSeeder = new RolePermissionSeeder();
    const adminSeeder = new UserSeeder();

    await systemSeeder.run(dataSource);
    await subsystemSeeder.run(dataSource);
    await moduleSeeder.run(dataSource);
    await actionSeeder.run(dataSource);
    await rolePermissionSeeder.run(dataSource);
    await adminSeeder.run(dataSource);
  }
}
