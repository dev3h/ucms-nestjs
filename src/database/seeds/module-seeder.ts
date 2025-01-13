import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Module } from '@/modules/module/entities/module.entity';
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';

export class ModuleSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const moduleRepository = dataSource.getRepository(Module);
    const subsystemRepository = dataSource.getRepository(Subsystem);

    try {
      // Fetch all subsystems and map them by their code
      const subsystems = await subsystemRepository.find();
      const subsystemsMap = new Map(
        subsystems.map((subsystem) => [subsystem.code, subsystem]),
      );

      // Define module data with subsystem codes
      const modules = [
        {
          name: 'Tìm kiếm sinh viên',
          code: 'tim_kiem_sv',
          subsystemCodes: ['hs_sv'],
        },
        {
          name: 'Cập nhật hồ sơ sinh viên',
          code: 'cap_nhat_hs_sv',
          subsystemCodes: ['hs_sv'],
        },
        {
          name: 'Đăng ký môn học',
          code: 'dk_mon_hoc',
          subsystemCodes: ['dk_hoc'],
        },
        {
          name: 'Xem danh sách học bổng',
          code: 'ds_hoc_bong',
          subsystemCodes: ['hoc_bong'],
        },
        {
          name: 'Tạo lịch giảng',
          code: 'tao_lich_giang',
          subsystemCodes: ['lich_giang'],
        },
        {
          name: 'Theo dõi lương',
          code: 'theo_doi_luong',
          subsystemCodes: ['luong_gv'],
        },
        {
          name: 'Quản lý tài liệu mượn',
          code: 'ql_tai_lieu_muon',
          subsystemCodes: ['muon_tra_sach'],
        },
        {
          name: 'Tìm kiếm tài liệu',
          code: 'tim_kiem_tai_lieu',
          subsystemCodes: ['tai_lieu'],
        },
        {
          name: 'Ghi nhận thu học phí',
          code: 'ghi_nhan_thu_hp',
          subsystemCodes: ['thu_hoc_phi'],
        },
        {
          name: 'Tạo hồ sơ ký túc xá',
          code: 'tao_hs_ktx',
          subsystemCodes: ['hs_ktx'],
        },
        {
          name: 'Kiểm tra phòng trống',
          code: 'kiem_tra_phong',
          subsystemCodes: ['phong_trong'],
        },
        {
          name: 'Tạo hợp đồng lao động',
          code: 'tao_hd_ld',
          subsystemCodes: ['hd_ld'],
        },
        {
          name: 'Theo dõi lịch sử làm việc',
          code: 'theo_doi_lsu_lv',
          subsystemCodes: ['lich_su_lv'],
        },
        {
          name: 'Lập lịch thi',
          code: 'lap_lich_thi',
          subsystemCodes: ['ky_thi'],
        },
        {
          name: 'Cập nhật thông tin môn học',
          code: 'cap_nhat_mon_hoc',
          subsystemCodes: ['mon_hoc'],
        },
        {
          name: 'Quản lý danh sách trang thiết bị',
          code: 'ql_ds_tb',
          subsystemCodes: ['trang_tb'],
        },
      ];

      // Prepare and save modules with relationships
      const modulesToSave = await Promise.all(
        modules.map(async ({ name, code, subsystemCodes }) => {
          const relatedSubsystems = subsystemCodes
            .map((subsystemCode) => subsystemsMap.get(subsystemCode))
            .filter(Boolean);

          if (!relatedSubsystems.length) {
            console.warn(
              `No valid subsystems found for module "${name}". Skipping.`,
            );
            return null;
          }

          const module = moduleRepository.create({
            name,
            code,
            subsystems: relatedSubsystems,
          });
          return module;
        }),
      );

      // Filter and save valid modules
      const validModules = modulesToSave.filter(Boolean);
      if (validModules.length) {
        await moduleRepository.save(validModules);
        console.log('Modules and relationships seeded successfully.');
      } else {
        console.warn('No valid modules to seed.');
      }
    } catch (error) {
      console.error('Error during ModuleSeeder run:', error);
    }
  }
}
