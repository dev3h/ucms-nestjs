import { Utils } from '@/utils/utils';

export class ActionDto {
  id: number;
  name: string;
  code: string;

  constructor(action: any) {
    this.id = action?.id;
    this.name = action?.name;
    this.code = action?.code;
  }

  static mapFromEntities(entities: any[]): ActionDto[] {
    return entities.map((entity) => new ActionDto(entity));
  }
}

export class ModuleDto {
  id: number;
  name: string;
  code: string;
  actions: ActionDto[];

  constructor(module: any) {
    this.id = module?.id;
    this.name = module?.name;
    this.code = module?.code;
    this.actions = ActionDto.mapFromEntities(module?.actions || []);
  }

  static mapFromEntities(entities: any[]): ModuleDto[] {
    return entities.map((entity) => new ModuleDto(entity));
  }
}

export class SubSystemDto {
  id: number;
  name: string;
  code: string;
  modules: ModuleDto[];

  constructor(subSystem: any) {
    this.id = subSystem?.id;
    this.name = subSystem?.name;
    this.code = subSystem?.code;
    this.modules = ModuleDto.mapFromEntities(subSystem?.modules || []);
  }

  static mapFromEntities(entities: any[]): SubSystemDto[] {
    return entities.map((entity) => new SubSystemDto(entity));
  }
}

export class SystemDetailDto {
  id: number;
  name: string;
  code: string;
  client_id: string;
  client_secret: string;
  created_at: string;
  redirect_uris: string;
  subsystems: SubSystemDto[];

  constructor(system: any) {
    this.id = system?.id;
    this.name = system?.name;
    this.code = system?.code;
    this.created_at = Utils.formatDate(system?.created_at);
    this.client_id = system?.client_id;
    this.client_secret = system?.client_secret;
    this.redirect_uris = system?.redirect_uris;
    this.subsystems = SubSystemDto.mapFromEntities(system?.subsystems || []);
  }

  static mapFromEntities(entities: any[]): SystemDetailDto[] {
    return entities.map((entity) => new SystemDetailDto(entity));
  }
}
