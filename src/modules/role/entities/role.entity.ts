import { Permission } from '@/modules/permission/entities/permission.entity';
import { User } from '@/modules/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinTable,
  BaseEntity,
} from 'typeorm';

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @ApiProperty({ description: 'When role was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When role was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When role was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_has_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
