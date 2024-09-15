import { Role } from '@/modules/role/entities/role.entity';
import { Utils } from '@/utils/utils';

export class UserDto {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: string[];

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.created_at = Utils.formatDate(user.created_at);
    this.roles = user?.roles?.map((role: Role) => role?.name);
  }

  static mapFromEntities(entities: any[]): UserDto[] {
    return entities.map((entity) => new UserDto(entity));
  }
}
