import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
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

  @ApiProperty({
    description: 'Description of the module',
    example: 'This is a module.',
  })
  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Subsystem, (subsystem) => subsystem.modules)
  subsystems: Subsystem[];

  @ManyToMany(() => Action, (action) => action.modules)
  @JoinTable({
    name: 'modules_actions', // Tùy chỉnh tên bảng trung gian nếu cần
  })
  actions: Action[];

  @ApiProperty({ description: 'When module was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When module was updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
