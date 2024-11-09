import { Utils } from '@/utils/utils';

export class RoleDto {
  id: number;
  name: string;
  code: string;
  number_of_permission: number;
  number_of_user: number;
  created_at: string;

  constructor(role: any) {
    this.id = role?.id;
    this.name = role?.name;
    this.code = role?.code;
    this.created_at = Utils.formatDate(role?.created_at);
    this.number_of_permission = role?.permissions?.length;
    this.number_of_user = role?.users?.length;
  }

  static mapFromEntities(entities: any[]): RoleDto[] {
    return entities.map((entity) => new RoleDto(entity));
  }
}
