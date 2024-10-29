import { Repository } from 'typeorm';

export class BaseService<T> {
  constructor(private readonly repository: Repository<T>) {}

  async softDelete(id: number): Promise<void> {
    await this.repository.update(
      { id } as any,
      { deleted_at: new Date() } as any,
    );
  }
}
