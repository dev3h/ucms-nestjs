import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Module } from '@/modules/module/entities/module.entity'; // Adjust the import path as necessary
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';

export class ModuleSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const moduleRepository = dataSource.getRepository(Module);
    const subsystemRepository = dataSource.getRepository(Subsystem);

    const subsystems = await subsystemRepository.find();

    const modules = [
      {
        name: 'Đăng ký học phần',
        code: 'MD01',
        subsystems: [subsystems.find((subsystem) => subsystem.code === 'PH01')],
      },
      {
        name: 'Kết quả học tập',
        code: 'MD02',
        subsystems: [subsystems.find((subsystem) => subsystem.code === 'PH02')],
      },
      {
        name: 'Chấm công tháng',
        code: 'MD03',
        subsystems: [subsystems.find((subsystem) => subsystem.code === 'PH03')],
      },
      {
        name: 'Tuyển dụng nhân sự',
        code: 'MD04',
        subsystems: [subsystems.find((subsystem) => subsystem.code === 'PH04')],
      },
      {
        name: 'Đánh giá nhân sự',
        code: 'MD05',
        subsystems: [subsystems.find((subsystem) => subsystem.code === 'PH04')],
      },
    ];

    for (const moduleData of modules) {
      const module = moduleRepository.create(moduleData);
      await moduleRepository.save(module);
    }
  }
}
