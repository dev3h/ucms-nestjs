// permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { Role } from '@/modules/role/entities/role.entity';
import { User } from '@/modules/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ unique: true })
  @Column()
  name: string;

  @Column()
  code: string;

  @ApiProperty({ description: 'When permission was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When permission was updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When permission was deleted' })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany(() => User, (user) => user.permissions)
  users: User[];
}
