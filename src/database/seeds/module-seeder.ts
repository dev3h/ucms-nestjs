import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Module } from '@/modules/module/entities/module.entity'; // Adjust the import path as necessary
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';

export class ModuleSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const moduleRepository = dataSource.getRepository(Module);
    const subsystemRepository = dataSource.getRepository(Subsystem);

    for (let i = 1; i <= 2; i++) {
      const module = moduleRepository.create({
        name: `Module ${i}`,
        code: `MOD${i}`,
      });

      await moduleRepository.save(module);
    }

    const modules = await moduleRepository.find();
    const subsystems = await subsystemRepository.find();

    for (const subsystem of subsystems) {
      subsystem.modules = [];
      const randomModules = modules
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 1);
      subsystem.modules.push(...randomModules);
      await subsystemRepository.save(subsystem);
    }
  }
}
