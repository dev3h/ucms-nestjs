// role.entity.ts
import { Permission } from '@/modules/permission/entities/permission.entity';
import { User } from '@/modules/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
