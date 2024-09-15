import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { System } from '../../modules/system/entities/system.entity';
import { v4 as uuidv4 } from 'uuid';

export class SystemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const systemRepository = dataSource.getRepository(System);

    for (let i = 1; i <= 2; i++) {
      let client_id: string;
      let client_secret: string;
      let isUnique = false;

      while (!isUnique) {
        client_id = uuidv4();
        client_secret = uuidv4();

        const existingSystem = await systemRepository.findOne({
          where: [{ client_id }, { client_secret }],
        });

        if (!existingSystem) {
          isUnique = true;
        }
      }
      const system = systemRepository.create({
        name: `Hệ thống ${i}`,
        code: `SYS${i}`,
        client_id,
        client_secret,
        redirect_uris: 'http://localhost:3000',
      });

      await systemRepository.save(system);
    }
  }
}
