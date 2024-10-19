import { System } from '@/modules/system/entities/system.entity';
import { DataSource } from 'typeorm';

export class UserPermissionDto {
  id: number;
  name: string;
  code: string;

  constructor(permission: any) {
    this.id = permission.id;
    this.name = permission.name;
    this.code = permission.code;
  }

  static mapFromEntities(entities: any[]): UserPermissionDto[] {
    return entities.map((entity) => new UserPermissionDto(entity));
  }

  static async toArray(
    permissions: any[],
    dataSource: DataSource,
  ): Promise<any[]> {
    // Get all system codes from permissions
    const systemCodes = [
      ...new Set(
        permissions.map((permission) => permission.code.split('-')[0]),
      ),
    ];

    // Get all systems with these codes
    const systems = await dataSource
      .getRepository(System)
      .createQueryBuilder('system')
      .where('system.code IN (:...systemCodes)', { systemCodes })
      .getMany();

    const systemsMap = new Map(systems.map((system) => [system.code, system]));

    const data = {};
    for (const permission of permissions) {
      const parts = permission.code.split('-');
      const systemCode = parts[0];

      const system = systemsMap.get(systemCode);

      // Initialize the arrays if they don't exist yet
      if (!data[system.id]) {
        data[system.id] = {
          id: system.id,
          name: system.name,
          code: system.code,
          permissions: [],
        };
      }

      data[system.id].permissions.push({
        id: permission.id,
        name: permission.name,
        code: permission.code,
      });
    }

    return Object.values(data);
  }
}
