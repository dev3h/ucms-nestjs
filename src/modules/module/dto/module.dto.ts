import { Utils } from '@/utils/utils';

export class ModuleDto {
  id: number;
  name: string;
  code: string;
  created_at: string;
  action_count: number;

  constructor(module: any) {
    this.id = module?.id;
    this.name = module?.name;
    this.code = module?.code;
    this.created_at = Utils.formatDate(module?.created_at);
    this.action_count = module?.actions?.length;
  }

  static mapFromEntities(entities: any[]): ModuleDto[] {
    return entities.map((entity) => new ModuleDto(entity));
  }
}
