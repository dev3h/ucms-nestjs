import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { System } from '@/modules/system/entities/system.entity';
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';

export class SubSystemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const systemRepository = dataSource.getRepository(System);
    const subsystemRepository = dataSource.getRepository(Subsystem);

    const systems = await systemRepository.find();

    for (let i = 1; i <= 10; i++) {
      const subsystem = subsystemRepository.create({
        name: `Hệ thống con ${i}`,
        code: `SUBSYS${i}`,
        system: systems[Math.floor(Math.random() * systems.length)], // Chọn ngẫu nhiên một System
      });

      await subsystemRepository.save(subsystem);
    }
  }
}
