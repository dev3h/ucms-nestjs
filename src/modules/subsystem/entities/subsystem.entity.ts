import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { System } from '../../system/entities/system.entity';
import { Module } from '../../module/entities/module.entity';

@Entity({ name: 'subsystems' })
export class Subsystem {
  @ApiProperty({ description: 'Primary key as Subsystem ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Subsystem name', example: 'Subsystem 1' })
  @Column()
  name: string;

  @ApiProperty({ description: 'SubSystem code', example: 'SUBSYS_001' })
  @Column()
  code: string;

  @ManyToOne(() => System, (system) => system.subsystems, {
    cascade: ['update', 'remove'],
  })
  @JoinColumn({ name: 'system_id' })
  system: System;

  @ManyToMany(() => Module, (module) => module.subsystems, { cascade: true })
  @JoinTable({
    name: 'subsystems_modules',
    joinColumn: {
      name: 'subsystem_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'module_id',
      referencedColumnName: 'id',
    },
  })
  modules: Module[];

  @ApiProperty({ description: 'When subsystem was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When subsystem was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When subsystem was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;
}
