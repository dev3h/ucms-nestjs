import { System } from '@/modules/system/entities/system.entity';
import { User } from '@/modules/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('device_sessions')
export class DeviceSession {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Device ID' })
  @Column({ type: 'text' })
  device_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Name' })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({ description: 'User agent' })
  @Column({ type: 'text' })
  ua: string;

  @ApiProperty({ description: 'Secret key' })
  @Column({ type: 'text' })
  secret_key: string;

  @ApiProperty({ description: 'Refresh token' })
  @Column({ type: 'text', nullable: true })
  refresh_token: string;

  @ApiProperty({ description: 'Expired at' })
  @Column({ type: 'timestamp' })
  expired_at: Date;

  @ApiProperty({ description: 'IP Address' })
  @Column({ type: 'varchar', length: 255 })
  ip_address: string;

  @ApiProperty({ description: 'Device Type' })
  @Column({
    type: 'tinyint',
    default: 1,
    comment: '1: Web, 2: Mobile,3: Unknown',
  })
  device_type: number;

  @ApiProperty({ description: 'os' })
  @Column({ type: 'varchar', length: 255, default: 'Unknown' })
  os: string;

  @ApiProperty({ description: 'Browser' })
  @Column({ type: 'varchar', length: 255, default: 'Unknown' })
  browser: string;

  @ApiProperty({ description: 'Session Type' })
  @Column({
    type: 'tinyint',
    default: 1,
    comment: '1: Dashboard Admin, 2: SSO System',
  })
  session_type: number;

  @ApiProperty({ description: 'When data was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When data was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When data was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;
}
