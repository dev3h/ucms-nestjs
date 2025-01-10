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
  BaseEntity,
} from 'typeorm';

import { Role } from '@/modules/role/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserHasPermission } from '@/modules/user/user-has-permission.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ unique: true })
  @ApiProperty({ description: 'description permission' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'format: syscode-subsyscode-modulecode-actioncode',
  })
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
