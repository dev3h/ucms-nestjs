export class DeviceSessionDto {
  id: number;
  name: string;
  email: string;
  refresh_token: string;

  constructor(deviceSession: any) {
    this.id = deviceSession?.id;
    this.name = deviceSession.user ? deviceSession.user.name : null;
    this.email = deviceSession.user ? deviceSession?.user.email : null;
    this.refresh_token = deviceSession.refresh_token;
  }

  static mapFromEntities(entities: any[]): DeviceSessionDto[] {
    return entities.map((entity) => new DeviceSessionDto(entity));
  }
}
