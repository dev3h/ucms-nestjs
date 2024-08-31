import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subsystem } from '../../subsystem/entities/subsystem.entity';

@Entity({ name: 'systems' })
export class System {
  @ApiProperty({ description: 'Primary key as System ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'System name', example: 'Main System' })
  @Column()
  name: string;

  @ApiProperty({ description: 'System code', example: 'SYS_001' })
  @Column()
  code: string;

  @OneToMany(() => Subsystem, (subsystem) => subsystem.system)
  subsystems: Subsystem[];

  @ApiProperty({ description: 'When system was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When system was updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When system was deleted' })
  @DeleteDateColumn()
  deletedAt?: Date;
}
