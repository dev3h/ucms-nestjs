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
}
