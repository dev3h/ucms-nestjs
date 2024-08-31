import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Module } from '../../module/entities/module.entity';

@Entity({ name: 'actions' })
export class Action {
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
  createdAt: Date;

  @ApiProperty({ description: 'When action was updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When action was deleted' })
  @DeleteDateColumn()
  deletedAt?: Date;
}
