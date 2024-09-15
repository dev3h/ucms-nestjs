// permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

import { Role } from '@/modules/role/entities/role.entity';
import { User } from '@/modules/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserHasPermission } from '@/modules/user/user-has-permission.entity';

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
  created_at: Date;

  @ApiProperty({ description: 'When permission was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When permission was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @OneToMany(
    () => UserHasPermission,
    (userHasPermission) => userHasPermission.permission,
  )
  userHasPermissions: UserHasPermission[];
}
