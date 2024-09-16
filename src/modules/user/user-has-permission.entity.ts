import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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

  @ApiProperty({ description: 'Permissions are assigned directly to users' })
  @Column({ type: 'boolean', default: false })
  is_direct: boolean;

  @ApiProperty({ description: 'Status perrmission' })
  @Column({
    type: 'tinyint',
    nullable: true,
    comment: '1 = added, 2 = ignored, NULL = inherited from role',
  })
  status: number | null;
}
