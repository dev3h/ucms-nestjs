import { Utils } from '@/utils/utils';

export class ActionDto {
  id: number;
  name: string;
  code: string;
  created_at: string;

  constructor(action: any) {
    this.id = action?.id;
    this.name = action?.name;
    this.code = action?.code;
    this.created_at = Utils.formatDate(action?.created_at);
  }

  static mapFromEntities(entities: any[]): ActionDto[] {
    return entities.map((entity) => new ActionDto(entity));
  }
}
