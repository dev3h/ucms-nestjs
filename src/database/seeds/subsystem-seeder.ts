import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { System } from '@/modules/system/entities/system.entity';
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';

export class SubSystemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const systemRepository = dataSource.getRepository(System);
    const subsystemRepository = dataSource.getRepository(Subsystem);

    const systems = await systemRepository.find();

    const subsystems = [
      {
        name: 'Phân hệ đăng ký',
        code: 'PH01',
        system: systems.find((system) => system.code === 'HT01'),
      },
      {
        name: 'Phân hệ học tập',
        code: 'PH02',
        system: systems.find((system) => system.code === 'HT01'),
      },
      {
        name: 'Phân hệ chấm công',
        code: 'PH03',
        system: systems.find((system) => system.code === 'HT02'),
      },
      {
        name: 'Phân hệ tuyển dụng',
        code: 'PH04',
        system: systems.find((system) => system.code === 'HT02'),
      },
    ];

    for (const subsystemData of subsystems) {
      const subsystem = subsystemRepository.create(subsystemData);
      await subsystemRepository.save(subsystem);
    }
  }
}
