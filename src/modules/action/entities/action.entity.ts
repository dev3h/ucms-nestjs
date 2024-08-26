import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
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

  @ApiProperty({
    description: 'Description of the action',
    example: 'This action allows creating records.',
  })
  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Module, (module) => module.actions)
  modules: Module[];

  @ApiProperty({ description: 'When action was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When action was updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
