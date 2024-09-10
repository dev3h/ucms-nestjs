// permission.entity.ts
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
import { User } from '@/modules/user/user.entity';
import { System } from '@/modules/system/entities/system.entity';

@Entity('system_tokens')
export class SystemToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.systemTokens)
  user: User;

  @ManyToOne(() => System, (system) => system.systemTokens)
  system: System;

  @ApiProperty({ description: 'Access token' })
  @Column()
  access_token: string;

  @ApiProperty({ description: 'Refresh token' })
  @Column()
  refresh_token: string;

  @ApiProperty({ description: 'Token expires in' })
  @Column()
  expires_at: Date;

  @ApiProperty({ description: 'When was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When was updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When was deleted' })
  @DeleteDateColumn()
  deletedAt?: Date;
}
