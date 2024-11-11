import { Utils } from '@/utils/utils';

class SystemDto {
  id: number;
  name: string;
  code: string;

  constructor(system: any) {
    this.id = system?.id;
    this.name = system?.name;
    this.code = system?.code;
  }
}
export class SubSystemDto {
  id: number;
  name: string;
  code: string;
  system: any;
  created_at: string;
  module_count: number;

  constructor(subsystem: any) {
    this.id = subsystem?.id;
    this.name = subsystem?.name;
    this.code = subsystem?.code;
    this.created_at = Utils.formatDate(subsystem?.created_at);
    this.system = new SystemDto(subsystem?.system);
    this.module_count = subsystem?.modules?.length;
  }

  static mapFromEntities(entities: any[]): SubSystemDto[] {
    return entities.map((entity) => new SubSystemDto(entity));
  }
}
