import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { System } from '../../modules/system/entities/system.entity';

export class SystemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const systemRepository = dataSource.getRepository(System);

    for (let i = 1; i <= 10; i++) {
      const system = systemRepository.create({
        name: `Hệ thống ${i}`,
        code: `SYS${i}`,
      });

      await systemRepository.save(system);
    }
  }
}
