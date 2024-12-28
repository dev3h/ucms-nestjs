import { Utils } from '@/utils/utils';
import { getLogLevelName } from '../enums/log-level.enum';

export class LogDto {
  id: number;
  level: string;
  created_at: string;
  message: string;
  status_code: string;
  ip_address: string;
  user_agent: string;
  stack_trace: string;
  module: string;
  function_name: string;
  additional_data: any;
  geo_location: any;

  constructor(log: any) {
    this.id = log?.id;
    this.level = getLogLevelName(log?.level);
    this.created_at = Utils.formatDateTime(log?.timestamp);
    this.message = log?.message;
    this.status_code = log?.status_code;
    this.ip_address = log?.ip_address;
    this.user_agent = log?.user_agent;
    this.stack_trace = log?.stack_trace;
    this.module = log?.module;
    this.function_name = log?.function_name;
    this.additional_data = log?.additional_data;
    this.geo_location = log?.geo_location;
  }

  static mapFromEntities(entities: any[]): LogDto[] {
    return entities.map((entity) => new LogDto(entity));
  }
}
