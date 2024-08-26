import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
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

  @ApiProperty({
    description: 'Description of the system',
    example: 'This is the main system.',
  })
  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Subsystem, (subsystem) => subsystem.system)
  subsystems: Subsystem[];

  @ApiProperty({ description: 'When system was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When system was updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
