import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subsystem } from '../../subsystem/entities/subsystem.entity';
import { Action } from '../../action/entities/action.entity';

@Entity({ name: 'modules' })
export class Module {
  @ApiProperty({ description: 'Primary key as Module ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Module name', example: 'Module A' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Module code', example: 'MOD_001' })
  @Column()
  code: string;

  @ManyToMany(() => Subsystem, (subsystem) => subsystem.modules)
  subsystems: Subsystem[];

  @ManyToMany(() => Action, (action) => action.modules)
  @JoinTable({
    name: 'modules_actions', // Tùy chỉnh tên bảng trung gian nếu cần
  })
  actions: Action[];

  @ApiProperty({ description: 'When module was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When module was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When module was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;
}
