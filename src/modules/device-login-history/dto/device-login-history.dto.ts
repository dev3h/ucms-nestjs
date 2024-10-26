export class DeviceLoginHistoryDto {
  id: number;
  name: string;
  email: string;

  constructor(deviceHistory: any) {
    this.id = deviceHistory?.id;
    this.name = deviceHistory.user ? deviceHistory.user.name : null;
    this.email = deviceHistory?.account_identifier;
  }

  static mapFromEntities(entities: any[]): DeviceLoginHistoryDto[] {
    return entities.map((entity) => new DeviceLoginHistoryDto(entity));
  }
}
