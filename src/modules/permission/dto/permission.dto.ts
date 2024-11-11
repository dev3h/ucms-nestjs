import { Utils } from '@/utils/utils';

export class PermissionDto {
  id: number;
  code: string;
  description: string;
  created_at: string;

  constructor(permission: any) {
    this.id = permission?.id;
    this.code = permission?.code;
    this.description = permission?.description;
    this.created_at = Utils.formatDate(permission?.created_at);
  }

  static mapFromEntities(entities: any[]): PermissionDto[] {
    return entities.map((entity) => new PermissionDto(entity));
  }
}
