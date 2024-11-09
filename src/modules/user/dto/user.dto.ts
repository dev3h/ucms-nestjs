import { Role } from '@/modules/role/entities/role.entity';
import { Utils } from '@/utils/utils';

export class UserDto {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: string[];
  type: string;
  two_factor_enable: boolean;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.created_at = Utils.formatDate(user.created_at);
    this.roles = user?.roles?.map((role: Role) => role?.name);
    this.type = user.type;
    this.two_factor_enable = user.two_factor_enable;
  }

  static mapFromEntities(entities: any[]): UserDto[] {
    return entities.map((entity) => new UserDto(entity));
  }
}
