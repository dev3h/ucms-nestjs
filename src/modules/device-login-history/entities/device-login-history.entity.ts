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

@Entity('device_login_histories')
export class DeviceLoginHistory {
  @ApiProperty({ description: 'Primary key', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Account Identifier' })
  @Column({ type: 'varchar', length: 255 })
  account_identifier: string;

  @ApiProperty({ description: 'Device Identifier' })
  @Column({ type: 'varchar', length: 255 })
  device_identifier: string;

  @ApiProperty({ description: 'Last login' })
  @Column({ type: 'timestamp' })
  last_login: Date;

  @ApiProperty({ description: 'Token when login success' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  session_token: string;

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
