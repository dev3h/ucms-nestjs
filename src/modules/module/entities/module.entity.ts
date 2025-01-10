import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subsystem } from '../../subsystem/entities/subsystem.entity';
import { Action } from '../../action/entities/action.entity';

@Entity({ name: 'modules' })
export class Module extends BaseEntity {
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

  @ManyToMany(() => Action, (action) => action.modules, {
    cascade: true,
  })
  @JoinTable({
    name: 'modules_actions',
    joinColumn: {
      name: 'module_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'action_id',
      referencedColumnName: 'id',
    },
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
