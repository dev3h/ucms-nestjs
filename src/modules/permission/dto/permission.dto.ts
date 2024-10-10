import { Utils } from '@/utils/utils';

export class PermissionDto {
  id: number;
  name: string;
  code: string;
  created_at: string;

  constructor(permission: any) {
    this.id = permission?.id;
    this.name = permission?.name;
    this.code = permission?.code;
    this.created_at = Utils.formatDate(permission?.created_at);
  }

  static mapFromEntities(entities: any[]): PermissionDto[] {
    return entities.map((entity) => new PermissionDto(entity));
  }
}
