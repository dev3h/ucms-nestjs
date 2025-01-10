import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { System } from '@/modules/system/entities/system.entity';

@Entity({ name: 'system_client_secrets' })
export class SystemClientSecret extends BaseEntity {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Client Secret' })
  @Column({ length: 255 })
  client_secret: string;

  @ManyToOne(() => System, (system) => system.clientSecrets)
  @JoinColumn({ name: 'system_id' })
  system: System;

  @ApiProperty({
    description: 'Status of the Client Secret',
    example: 'active',
  })
  @Column({
    type: 'boolean',
    default: true,
  })
  is_enabled: boolean;

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
