import { Role } from '@/modules/role/entities/role.entity';
import { Utils } from '@/utils/utils';

export class RoleDto {
  id: number;
  name: string;
  code: string;
  created_at: string;

  constructor(role: any) {
    this.id = role?.id;
    this.name = role?.name;
    this.code = role?.code;
    this.created_at = Utils.formatDate(role?.created_at);
  }

  static mapFromEntities(entities: any[]): RoleDto[] {
    return entities.map((entity) => new RoleDto(entity));
  }
}
