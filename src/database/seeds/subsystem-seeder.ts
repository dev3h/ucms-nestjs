import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { System } from '@/modules/system/entities/system.entity';
import { Subsystem } from '@/modules/subsystem/entities/subsystem.entity';

export class SubSystemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const systemRepository = dataSource.getRepository(System);
    const subsystemRepository = dataSource.getRepository(Subsystem);

    // Fetch all systems from the database
    const systems = await systemRepository.find();

    const subsystems = [
      { name: 'Quản lý hồ sơ sinh viên', code: 'hs_sv', system_code: 'qlsv' },
      { name: 'Quản lý đăng ký học', code: 'dk_hoc', system_code: 'qlsv' },
      { name: 'Quản lý học bổng', code: 'hoc_bong', system_code: 'qlsv' },
      {
        name: 'Quản lý lương giảng viên',
        code: 'luong_gv',
        system_code: 'qlgv',
      },
      {
        name: 'Quản lý lịch giảng dạy',
        code: 'lich_giang',
        system_code: 'qlgv',
      },
      {
        name: 'Quản lý mượn/trả sách',
        code: 'muon_tra_sach',
        system_code: 'qltv',
      },
      { name: 'Quản lý tài liệu', code: 'tai_lieu', system_code: 'qltv' },
      { name: 'Quản lý thu học phí', code: 'thu_hoc_phi', system_code: 'qltc' },
      {
        name: 'Quản lý chi phí hoạt động',
        code: 'chi_phi',
        system_code: 'qltc',
      },
      { name: 'Quản lý hồ sơ ký túc xá', code: 'hs_ktx', system_code: 'qlktx' },
      {
        name: 'Quản lý phòng trống',
        code: 'phong_trong',
        system_code: 'qlktx',
      },
      { name: 'Quản lý hợp đồng lao động', code: 'hd_ld', system_code: 'qlns' },
      {
        name: 'Quản lý lịch sử làm việc',
        code: 'lich_su_lv',
        system_code: 'qlns',
      },
      { name: 'Quản lý kỳ thi', code: 'ky_thi', system_code: 'kh_thi' },
      { name: 'Quản lý lịch thi', code: 'lich_thi', system_code: 'kh_thi' },
      {
        name: 'Quản lý chương trình đào tạo',
        code: 'ctdt',
        system_code: 'qldt',
      },
      { name: 'Quản lý môn học', code: 'mon_hoc', system_code: 'qldt' },
      { name: 'Quản lý phòng học', code: 'phong_hoc', system_code: 'qlcsvc' },
      {
        name: 'Quản lý trang thiết bị',
        code: 'trang_tb',
        system_code: 'qlcsvc',
      },
    ];

    // Iterate through subsystems and save them to the database
    for (const subsystemData of subsystems) {
      // Find the corresponding system based on system_code
      const system = systems.find(
        (system) => system.code === subsystemData.system_code,
      );

      // If system is found, check and save the subsystem
      if (system) {
        const existingSubsystem = await subsystemRepository.findOne({
          where: {
            code: subsystemData.code,
            system: { id: system.id }, // Reference the system by ID
          },
        });

        // Create and save the subsystem if it doesn't exist
        if (!existingSubsystem) {
          const subsystem = subsystemRepository.create({
            name: subsystemData.name,
            code: subsystemData.code,
            system, // Assign the corresponding system
          });
          await subsystemRepository.save(subsystem);
        }
      } else {
        console.warn(
          `System with code ${subsystemData.system_code} not found.`,
        );
      }
    }
  }
}
