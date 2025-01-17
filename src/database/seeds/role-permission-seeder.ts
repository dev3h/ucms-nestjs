import { Seeder } from 'typeorm-extension';
import { DataSource, In } from 'typeorm';
import { Role } from '@/modules/role/entities/role.entity';
import { Permission } from '@/modules/permission/entities/permission.entity';
import { System } from '@/modules/system/entities/system.entity';

export class RolePermissionSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const systemRepository = dataSource.getRepository(System);

    // Tạo các vai trò bằng tiếng Việt
    const roles = [
      { name: 'Quản trị viên cao cấp', code: 'SUPER_ADMIN' },
      { name: 'Quản trị viên', code: 'ADMIN' },
      { name: 'Giảng viên', code: 'TEACHER' },
      { name: 'Cán bộ tài chính', code: 'FINANCE_OFFICER' },
      { name: 'Cán bộ ký túc xá', code: 'DORMITORY_STAFF' },
      { name: 'Sinh viên', code: 'STUDENT' },
    ];

    // Lưu các vai trò vào cơ sở dữ liệu
    for (const roleData of roles) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
    }

    // Tạo và lưu các quyền vào cơ sở dữ liệu
    const permissions = [
      {
        description: 'Thêm mới sinh viên',
        code: 'qlsv-hs_sv-tim_kiem_sv-them_moi',
      },
      {
        description: 'Sửa hồ sơ sinh viên',
        code: 'qlsv-hs_sv-cap_nhat_hs_sv-sua',
      },
      {
        description: 'Đăng ký môn học',
        code: 'qlsv-dk_hoc-dk_mon_hoc-qlsv-dk_hoc-dk_mon_hoc-dang_ky_mon_hoc',
      },
      {
        description: 'Xem danh sách học bổng',
        code: 'qlsv-hoc_bong-ds_hoc_bong-xem_chi_tiet',
      },
      {
        description: 'Quản lý tài liệu mượn',
        code: 'qltv-muon_tra_sach-ql_tai_lieu_muon-xuat_du_lieu',
      },
      {
        description: 'Quản lý thu học phí',
        code: 'qltc-thu_hoc_phi-ghi_nhan_thu_hp-in_bao_cao',
      },
      {
        description: 'Kiểm tra phòng trống',
        code: 'qlktx-phong_trong-kiem_tra_phong-sua',
      },
      {
        description: 'Tạo hợp đồng lao động',
        code: 'qlns-hd_ld-tao_hd_ld-xoa',
      },
      {
        description: 'Quản lý danh sách trang thiết bị',
        code: 'qlcsvc-trang_tb-ql_ds_tb-in_bao_cao',
      },
    ];

    // Lưu các quyền vào cơ sở dữ liệu
    for (const permissionData of permissions) {
      const permission = permissionRepository.create(permissionData);
      await permissionRepository.save(permission);
    }

    const allSystems = await systemRepository.find({
      relations: [
        'subsystems',
        'subsystems.modules',
        'subsystems.modules.actions',
      ],
    });
    const filteredSystems = allSystems
      ?.map((system) => {
        const validSubsystems = system?.subsystems?.map((subsystem) => {
          // Lọc ra các modules có actions không rỗng
          const validModules = subsystem?.modules?.filter(
            (module) =>
              Array.isArray(module?.actions) && module.actions.length > 0,
          );

          // Nếu có modules hợp lệ thì giữ lại subsystem
          return validModules?.length > 0
            ? { ...subsystem, modules: validModules }
            : null;
        });

        // Lọc ra các subsystems hợp lệ
        const filteredSubsystems = validSubsystems?.filter(
          (subsystem) => subsystem,
        );

        // Nếu system có subsystems hợp lệ thì giữ lại system
        return filteredSubsystems?.length > 0
          ? { ...system, subsystems: filteredSubsystems }
          : null;
      })
      ?.filter((system) => system);

    // async permission
    const perms = [];
    const existingPermissions = await permissionRepository.find();

    filteredSystems.forEach((system) => {
      system?.subsystems?.forEach((subsystem) => {
        subsystem?.modules?.forEach((module) => {
          module?.actions?.forEach((action) => {
            const permissionCode = `${system.code}-${subsystem.code}-${module.code}-${action.code}`;
            if (!existingPermissions.some((p) => p.code === permissionCode)) {
              perms.push({
                code: permissionCode,
                description: action.name,
              });
            }
          });
        });
      });
    });

    // Save to database
    if (perms.length > 0) {
      await permissionRepository.save(perms);
    }

    // Gán quyền cho các vai trò
    const superAdminRole = await roleRepository.findOne({
      where: { name: 'Quản trị viên cao cấp' },
      relations: ['permissions'],
    });
    const allPermissions = await permissionRepository.find();
    if (superAdminRole) {
      superAdminRole.permissions = allPermissions;
      await roleRepository.save(superAdminRole);
    }

    // Gán quyền cho vai trò Quản trị viên
    const adminRole = await roleRepository.findOne({
      where: { name: 'Quản trị viên' },
      relations: ['permissions'],
    });
    if (adminRole) {
      const adminPermissions = [
        'qlsv-hs_sv-tim_kiem_sv-them_moi',
        'qlsv-hs_sv-cap_nhat_hs_sv-sua',
        'qltv-muon_tra_sach-ql_tai_lieu_muon-xuat_du_lieu',
        'qlns-hd_ld-tao_hd_ld-xoa',
        'qlcsvc-trang_tb-ql_ds_tb-in_bao_cao',
      ];
      const permissions = await permissionRepository.find({
        where: {
          code: In(adminPermissions),
        },
      });
      adminRole.permissions = permissions;
      await roleRepository.save(adminRole);
    }

    // Gán quyền cho vai trò Giảng viên
    const teacherRole = await roleRepository.findOne({
      where: { name: 'Giảng viên' },
      relations: ['permissions'],
    });
    if (teacherRole) {
      const teacherPermissions = [
        'qlsv-dk_hoc-dk_mon_hoc-qlsv-dk_hoc-dk_mon_hoc-dang_ky_mon_hoc',
        'qlsv-hoc_bong-ds_hoc_bong-xem_chi_tiet',
      ];
      const permissions = await permissionRepository.find({
        where: {
          code: In(teacherPermissions),
        },
      });
      teacherRole.permissions = permissions;
      await roleRepository.save(teacherRole);
    }

    // Gán quyền cho vai trò Cán bộ tài chính
    const financeOfficerRole = await roleRepository.findOne({
      where: { name: 'Cán bộ tài chính' },
      relations: ['permissions'],
    });
    if (financeOfficerRole) {
      const financePermissions = [
        'qltc-thu_hoc_phi-ghi_nhan_thu_hp-in_bao_cao',
      ];
      const permissions = await permissionRepository.find({
        where: {
          code: In(financePermissions),
        },
      });
      financeOfficerRole.permissions = permissions;
      await roleRepository.save(financeOfficerRole);
    }

    // Gán quyền cho vai trò Cán bộ ký túc xá
    const dormitoryStaffRole = await roleRepository.findOne({
      where: { name: 'Cán bộ ký túc xá' },
      relations: ['permissions'],
    });
    if (dormitoryStaffRole) {
      const dormitoryPermissions = ['qlktx-phong_trong-kiem_tra_phong-sua'];
      const permissions = await permissionRepository.find({
        where: {
          code: In(dormitoryPermissions),
        },
      });
      dormitoryStaffRole.permissions = permissions;
      await roleRepository.save(dormitoryStaffRole);
    }

    // Gán quyền cho vai trò Sinh viên
    const studentRole = await roleRepository.findOne({
      where: { name: 'Sinh viên' },
      relations: ['permissions'],
    });
    if (studentRole) {
      const studentPermissions = [
        'qlsv-dk_hoc-dk_mon_hoc-qlsv-dk_hoc-dk_mon_hoc-dang_ky_mon_hoc',
      ];
      const permissions = await permissionRepository.find({
        where: {
          code: In(studentPermissions),
        },
      });
      studentRole.permissions = permissions;
      await roleRepository.save(studentRole);
    }
  }
}
