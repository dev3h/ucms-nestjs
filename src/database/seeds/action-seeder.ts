import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Module } from '@/modules/module/entities/module.entity';
import { Action } from '@/modules/action/entities/action.entity';

export class ActionSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const actionRepository = dataSource.getRepository(Action);
    const moduleRepository = dataSource.getRepository(Module);

    for (let i = 1; i <= 10; i++) {
      const action = actionRepository.create({
        name: `Action ${i}`,
        code: `ACT${i}`,
      });

      await actionRepository.save(action);
    }

    const actions = await actionRepository.find();
    const modules = await moduleRepository.find();

    for (const module of modules) {
      module.actions = [];
      const randomActions = actions
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 1);
      module.actions.push(...randomActions);
      await moduleRepository.save(module);
    }
  }
}
