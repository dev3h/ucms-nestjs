import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { System } from '@/modules/system/entities/system.entity';

@Entity({ name: 'system_client_secrets' })
// @Unique(['name', 'code', 'client_id', 'client_secret'])
export class SystemClientSecret {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Client Secret' })
  @Column({ length: 255 })
  client_secret: string;

  @ManyToOne(() => System, (system) => system.clientSecrets)
  system: System;

  @ApiProperty({
    description: 'Status of the Client Secret',
    example: 'active',
  })
  @Column({
    type: 'tinyint',
    comment: '1 = enabled, 2 = disabled',
    default: 1,
  })
  status: number;

  @ApiProperty({ description: 'When Client Secret was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When Client Secret was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When Client Secret was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;
}
