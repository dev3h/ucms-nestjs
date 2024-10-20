import { Utils } from '@/utils/utils';

export class ActionDto {
  id: number;
  name: string;
  code: string;
  granted: boolean;
  permission_code: string; // Add permission_code property
  status: number;
  is_direct: boolean;

  constructor(
    action: any,
    moduleCode: string,
    subsystemCode: string,
    systemCode: string,
  ) {
    this.id = action?.id;
    this.name = action?.name;
    this.code = action?.code;
    this.granted = false;
    // Generate permission_code based on system, subsystem, module, and action codes
    this.permission_code = `${systemCode}-${subsystemCode}-${moduleCode}-${action?.code}`;
    this.status = null;
    this.is_direct = false;
  }

  static mapFromEntities(
    entities: any[],
    moduleCode: string,
    subsystemCode: string,
    systemCode: string,
  ): ActionDto[] {
    return entities.map(
      (entity) => new ActionDto(entity, moduleCode, subsystemCode, systemCode),
    );
  }
}

export class ModuleDto {
  id: number;
  name: string;
  code: string;
  actions: ActionDto[];

  constructor(module: any, subsystemCode: string, systemCode: string) {
    this.id = module?.id;
    this.name = module?.name;
    this.code = module?.code;
    // Pass subsystemCode and systemCode down to ActionDto
    this.actions = ActionDto.mapFromEntities(
      module?.actions || [],
      this.code,
      subsystemCode,
      systemCode,
    );
  }

  static mapFromEntities(
    entities: any[],
    subsystemCode: string,
    systemCode: string,
  ): ModuleDto[] {
    return entities.map(
      (entity) => new ModuleDto(entity, subsystemCode, systemCode),
    );
  }
}

export class SubSystemDto {
  id: number;
  name: string;
  code: string;
  modules: ModuleDto[];

  constructor(subSystem: any, systemCode: string) {
    this.id = subSystem?.id;
    this.name = subSystem?.name;
    this.code = subSystem?.code;
    // Pass systemCode down to ModuleDto
    this.modules = ModuleDto.mapFromEntities(
      subSystem?.modules || [],
      this.code,
      systemCode,
    );
  }

  static mapFromEntities(entities: any[], systemCode: string): SubSystemDto[] {
    return entities.map((entity) => new SubSystemDto(entity, systemCode));
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
    this.subsystems = SubSystemDto.mapFromEntities(
      system?.subsystems || [],
      this.code,
    );
  }

  static mapFromEntities(entities: any[]): SystemDetailDto[] {
    return entities.map((entity) => new SystemDetailDto(entity));
  }
}
