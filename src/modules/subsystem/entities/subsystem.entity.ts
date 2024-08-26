import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
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

  @ApiProperty({
    description: 'Description of the subsystem',
    example: 'This is a subsystem.',
  })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => System, (system) => system.subsystems)
  system: System;

  @ManyToMany(() => Module, (module) => module.subsystems)
  @JoinTable({
    name: 'subsystems_modules', // Tùy chỉnh tên bảng trung gian ở đây
  })
  modules: Module[];

  @ApiProperty({ description: 'When subsystem was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When subsystem was updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
