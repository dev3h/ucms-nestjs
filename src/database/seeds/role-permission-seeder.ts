import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '@/modules/role/entities/role.entity';
import { Permission } from '@/modules/permission/entities/permission.entity';

export class RolePermissionSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    // Tạo các vai trò bằng tiếng Việt
    const roles = [
      { name: 'Quản trị viên cao cấp', code: 'SUPER_ADMIN' },
      { name: 'Quản trị viên', code: 'ADMIN' },
      { name: 'Quản lý sinh viên', code: 'STUDENT_AFFAIRS' },
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
        code: 'qlsv-dk_hoc-dk_mon_hoc-dang_ky_mon_hoc',
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

    // Gán quyền cho vai trò Quản lý sinh viên
    const studentAffairsRole = await roleRepository.findOne({
      where: { name: 'Quản lý sinh viên' },
      relations: ['permissions'],
    });
    if (studentAffairsRole) {
      const studentPermissions = [
        'qlsv-hs_sv-tim_kiem_sv-them_moi',
        'qlsv-hs_sv-cap_nhat_hs_sv-sua',
        'qlsv-dk_hoc-dk_mon_hoc-dang_ky_mon_hoc',
      ];
      studentAffairsRole.permissions =
        await permissionRepository.findByIds(studentPermissions);
      await roleRepository.save(studentAffairsRole);
    }

    // Gán quyền cho vai trò Giảng viên
    const teacherRole = await roleRepository.findOne({
      where: { name: 'Giảng viên' },
      relations: ['permissions'],
    });
    if (teacherRole) {
      const teacherPermissions = [
        'qlsv-dk_hoc-dk_mon_hoc-dang_ky_mon_hoc',
        'qlsv-hoc_bong-ds_hoc_bong-xem_chi_tiet',
      ];
      teacherRole.permissions =
        await permissionRepository.findByIds(teacherPermissions);
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
      financeOfficerRole.permissions =
        await permissionRepository.findByIds(financePermissions);
      await roleRepository.save(financeOfficerRole);
    }

    // Gán quyền cho vai trò Cán bộ ký túc xá
    const dormitoryStaffRole = await roleRepository.findOne({
      where: { name: 'Cán bộ ký túc xá' },
      relations: ['permissions'],
    });
    if (dormitoryStaffRole) {
      const dormitoryPermissions = ['qlktx-phong_trong-kiem_tra_phong-sua'];
      dormitoryStaffRole.permissions =
        await permissionRepository.findByIds(dormitoryPermissions);
      await roleRepository.save(dormitoryStaffRole);
    }

    // Gán quyền cho vai trò Sinh viên
    const studentRole = await roleRepository.findOne({
      where: { name: 'Sinh viên' },
      relations: ['permissions'],
    });
    if (studentRole) {
      const studentPermissions = ['qlsv-dk_hoc-dk_mon_hoc-dang_ky_mon_hoc'];
      studentRole.permissions =
        await permissionRepository.findByIds(studentPermissions);
      await roleRepository.save(studentRole);
    }
  }
}
