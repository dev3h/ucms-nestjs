import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Module } from '@/modules/module/entities/module.entity';
import { Action } from '@/modules/action/entities/action.entity';

export class ActionSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const actionRepository = dataSource.getRepository(Action);
    const moduleRepository = dataSource.getRepository(Module);

    const modules = await moduleRepository.find();

    const actions = [
      {
        name: 'Thêm mới',
        code: 'TT01',
        modules: [modules.find((module) => module.code === 'MD01')],
      },
      {
        name: 'Xóa',
        code: 'TT02',
        modules: [modules.find((module) => module.code === 'MD02')],
      },
      {
        name: 'Cập nhật',
        code: 'TT03',
        modules: [modules.find((module) => module.code === 'MD03')],
      },
      {
        name: 'Xem',
        code: 'TT04',
        modules: [modules.find((module) => module.code === 'MD04')],
      },
      {
        name: 'Duyệt',
        code: 'TT05',
        modules: [modules.find((module) => module.code === 'MD05')],
      },
    ];

    for (const actionData of actions) {
      const action = actionRepository.create(actionData);
      await actionRepository.save(action);
    }
  }
}
