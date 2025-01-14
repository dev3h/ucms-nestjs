import { Role } from '@/modules/role/entities/role.entity';
import { Utils } from '@/utils/utils';
import { UserTypeEnum } from '../enums/user-type.enum';

export class UserDetailDto {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: string[];
  role_ids: number[];
  type: number;
  type_name: string;
  two_factor_enable: boolean;
  phone_number: string;
  status: number;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.created_at = Utils.formatDate(user.created_at);
    this.roles = user?.roles?.map((role: Role) => role?.name);
    this.role_ids = user?.roles?.map((role: Role) => role?.id);
    this.type = user.type;
    this.type_name = UserTypeEnum[user.type];
    this.two_factor_enable = user.two_factor_enable;
    this.phone_number = user.phone_number;
    this.status = user.status;
  }

  static mapFromEntities(entities: any[]): UserDetailDto[] {
    return entities.map((entity) => new UserDetailDto(entity));
  }
}
