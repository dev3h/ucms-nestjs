import { Utils } from '@/utils/utils';

export class SystemDto {
  id: number;
  name: string;
  code: string;
  client_id: string;
  client_secret: string;
  created_at: string;
  redirect_uris: string;
  subsystem_count: number;

  constructor(system: any) {
    this.id = system?.id;
    this.name = system?.name;
    this.code = system?.code;
    this.created_at = Utils.formatDate(system?.created_at);
    this.client_id = system?.client_id;
    this.client_secret = system?.client_secret;
    this.redirect_uris = system?.redirect_uris;
    this.subsystem_count = system?.subsystems?.length;
  }

  static mapFromEntities(entities: any[]): SystemDto[] {
    return entities.map((entity) => new SystemDto(entity));
  }
}
