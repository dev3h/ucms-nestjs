import { Utils } from '@/utils/utils';

export class SubSystemDto {
  id: number;
  name: string;
  code: string;
  created_at: string;

  constructor(subsystem: any) {
    this.id = subsystem?.id;
    this.name = subsystem?.name;
    this.code = subsystem?.code;
    this.created_at = Utils.formatDate(subsystem?.created_at);
  }

  static mapFromEntities(entities: any[]): SubSystemDto[] {
    return entities.map((entity) => new SubSystemDto(entity));
  }
}
