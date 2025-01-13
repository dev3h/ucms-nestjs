import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Module } from '@/modules/module/entities/module.entity';
import { Action } from '@/modules/action/entities/action.entity';

export class ActionSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const actionRepository = dataSource.getRepository(Action);
    const moduleRepository = dataSource.getRepository(Module);

    // Lấy tất cả mô-đun từ cơ sở dữ liệu
    const modules = await moduleRepository.find();

    // Định nghĩa các hành động (actions)
    const actions = [
      {
        name: 'Thêm mới',
        code: 'them_moi',
        modules: [
          modules.find((module) => module.code === 'tim_kiem_sv'),
          modules.find((module) => module.code === 'cap_nhat_hs_sv'),
          modules.find((module) => module.code === 'dk_mon_hoc'),
          modules.find((module) => module.code === 'ql_tai_lieu_muon'),
          modules.find((module) => module.code === 'tao_lich_giang'),
          modules.find((module) => module.code === 'tao_hs_ktx'),
          modules.find((module) => module.code === 'tao_hd_ld'),
          modules.find((module) => module.code === 'lap_lich_thi'),
          modules.find((module) => module.code === 'cap_nhat_mon_hoc'),
          modules.find((module) => module.code === 'ql_ds_tb'),
        ],
      },
      {
        name: 'Sửa',
        code: 'sua',
        modules: [
          modules.find((module) => module.code === 'dk_mon_hoc'),
          modules.find((module) => module.code === 'cap_nhat_hs_sv'),
        ],
      },
      {
        name: 'Xóa',
        code: 'xoa',
        modules: [modules.find((module) => module.code === 'dk_mon_hoc')],
      },
      {
        name: 'Xem chi tiết',
        code: 'xem_chi_tiet',
        modules: [
          modules.find((module) => module.code === 'ds_hoc_bong'),
          modules.find((module) => module.code === 'tao_lich_giang'),
          modules.find((module) => module.code === 'theo_doi_luong'),
          modules.find((module) => module.code === 'ql_tai_lieu_muon'),
        ],
      },
      {
        name: 'Tìm kiếm',
        code: 'tim_kiem',
        modules: [
          modules.find((module) => module.code === 'tim_kiem_sv'),
          modules.find((module) => module.code === 'tao_lich_giang'),
          modules.find((module) => module.code === 'tim_kiem_tai_lieu'),
        ],
      },
      {
        name: 'Phê duyệt',
        code: 'phe_duyet',
        modules: [modules.find((module) => module.code === 'theo_doi_luong')],
      },
      {
        name: 'Xuất dữ liệu',
        code: 'xuat_du_lieu',
        modules: [
          modules.find((module) => module.code === 'ql_tai_lieu_muon'),
          modules.find((module) => module.code === 'theo_doi_luong'),
        ],
      },
      {
        name: 'Nhập dữ liệu',
        code: 'nhap_du_lieu',
        modules: [
          modules.find((module) => module.code === 'tim_kiem_tai_lieu'),
        ],
      },
      {
        name: 'In báo cáo',
        code: 'in_bao_cao',
        modules: [modules.find((module) => module.code === 'ghi_nhan_thu_hp')],
      },
    ];

    // Lưu các hành động vào cơ sở dữ liệu
    for (const actionData of actions) {
      const action = actionRepository.create(actionData);
      await actionRepository.save(action);
    }
  }
}
