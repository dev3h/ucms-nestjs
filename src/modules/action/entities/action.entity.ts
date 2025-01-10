import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Module } from '../../module/entities/module.entity';

@Entity({ name: 'actions' })
export class Action extends BaseEntity {
  @ApiProperty({ description: 'Primary key as Action ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Action name', example: 'Create' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Action code', example: 'ACT_001' })
  @Column()
  code: string;

  @ManyToMany(() => Module, (module) => module.actions)
  modules: Module[];

  @ApiProperty({ description: 'When action was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When action was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When action was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;
}
