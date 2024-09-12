import { Utils } from '@/utils/utils';

export class SystemDto {
  id: number;
  name: string;
  code: string;
  created_at: string;

  constructor(system: any) {
    this.id = system.id;
    this.name = system.name;
    this.code = system.code;
    this.created_at = Utils.formatDate(system.created_at);
  }

  static mapFromEntities(entities: any[]): SystemDto[] {
    return entities.map((entity) => new SystemDto(entity));
  }
}
