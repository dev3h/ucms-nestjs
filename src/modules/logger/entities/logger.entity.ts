import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'logs' })
export class Log {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'tinyint',
    comment: '0: debug, 1: info, 2: warning, 3: error, 4: critical',
  })
  level: number;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'bigint', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  module: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  function_name: string;

  @Column({ type: 'int', nullable: true })
  status_code: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'text', nullable: true })
  stack_trace: string;

  @Column({ type: 'json', nullable: true })
  additional_data: object;

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
