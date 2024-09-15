import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Permission } from '../permission/entities/permission.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_has_permissions')
export class UserHasPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userHasPermissions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Permission, (permission) => permission.userHasPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @ApiProperty({ description: 'Quyền được gán trực tiếp cho user' })
  @Column({ type: 'boolean', default: false })
  is_direct: boolean; // true: quyền được gán trực tiếp cho user, false: quyền từ role
}
