import { Utils } from '@/utils/utils';

export class ActionDto {
  id: number;
  name: string;
  code: string;
  created_at: string;

  constructor(module: any) {
    this.id = module?.id;
    this.name = module?.name;
    this.code = module?.code;
    this.created_at = Utils.formatDate(module?.created_at);
  }

  static mapFromEntities(entities: any[]): ActionDto[] {
    return entities.map((entity) => new ActionDto(entity));
  }
}
