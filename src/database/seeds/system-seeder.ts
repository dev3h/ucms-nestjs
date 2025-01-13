import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { System } from '@/modules/system/entities/system.entity';
import { SystemClientSecret } from '@/modules/system-client-secret/entities/system-client-secret.entity';

export class SystemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const systemRepository = dataSource.getRepository(System);
    const clientSecretRepository = dataSource.getRepository(SystemClientSecret);

    const systems = [
      {
        name: 'Hệ thống quản lý sinh viên',
        code: 'qlsv',
        client_id: '',
        client_secret: 'L49ijGoCUOAJucNAk8VZMRHIlxMbJdTM9N09ir3Ab7QR',
        redirect_uris: ['http://localhost:3000', 'http://localhost:3002'],
      },
      {
        name: 'Hệ thống quản lý giảng viên',
        code: 'qlgv',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3002', 'http://localhost:3003'],
      },
      {
        name: 'Hệ thống thư viện',
        code: 'qltv',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3004', 'http://localhost:3005'],
      },
      {
        name: 'Hệ thống tài chính',
        code: 'qltc',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3006', 'http://localhost:3007'],
      },
      {
        name: 'Hệ thống quản lý ký túc xá',
        code: 'qlktx',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3008', 'http://localhost:3009'],
      },
      {
        name: 'Hệ thống quản lý nhân sự',
        code: 'qlns',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3010', 'http://localhost:3011'],
      },
      {
        name: 'Hệ thống khảo thí',
        code: 'kh_thi',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3012', 'http://localhost:3013'],
      },
      {
        name: 'Hệ thống quản lý đào tạo',
        code: 'qldt',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3014', 'http://localhost:3015'],
      },
      {
        name: 'Hệ thống quản lý cơ sở vật chất',
        code: 'qlcsvc',
        client_id: '',
        client_secret: '',
        redirect_uris: ['http://localhost:3016', 'http://localhost:3017'],
      },
    ];

    for (const systemData of systems) {
      let client_id: string;
      let client_secret: string | null = null;
      let isUnique = false;

      while (!isUnique) {
        client_id = uuidv4();
        if (systemData.code !== 'qlsv') {
          client_secret = uuidv4();
        } else {
          client_secret = systemData.client_secret;
        }

        const existingSystem = await systemRepository.findOne({
          where: { client_id },
        });

        const existingClientSecret = client_secret
          ? await clientSecretRepository.findOne({
              where: { client_secret },
            })
          : null;

        if (!existingSystem && !existingClientSecret) {
          isUnique = true;
        }
      }

      systemData.client_id = client_id;

      const system = systemRepository.create(systemData);
      await systemRepository.save(system);

      if (client_secret) {
        const clientSecretEntity = clientSecretRepository.create({
          client_secret: client_secret,
          system: system,
        });
        await clientSecretRepository.save(clientSecretEntity);
      }
    }
  }
}
