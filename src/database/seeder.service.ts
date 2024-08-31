import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './seeds/database-seeder';

@Injectable()
export class SeederService {
  constructor(private readonly dataSource: DataSource) {}

  async runDatabaseSeeder() {
    const seeder = new DatabaseSeeder();
    await seeder.run(this.dataSource);
  }
}
