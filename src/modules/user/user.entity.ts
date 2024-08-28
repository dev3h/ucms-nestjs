import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

import { UserRoles } from './enums/user.enum';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @ApiProperty({ description: 'Primary key as User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User name', example: 'Jhon Doe' })
  @Column()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'jhon.doe@gmail.com',
  })
  @Column({
    unique: true,
  })
  email: string;

  @ApiProperty({ description: 'Hashed user password' })
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.MEMBER })
  role: UserRoles;

  @ApiProperty({ description: 'User status' })
  @Column()
  status: number;

  @ApiProperty({ description: 'token when change password first time' })
  @Column({ nullable: true })
  token_first_time: string;

  @ApiProperty({ description: 'Two factor secret' })
  @Column({ nullable: true })
  two_factor_secret: string;

  @ApiProperty({ description: 'Two factor recovery code' })
  @Column({ nullable: true })
  two_factor_recovery_code: string;

  @ApiProperty({ description: 'Two factor enable' })
  @Column({ default: false })
  two_factor_enable: boolean;

  @ApiProperty({ description: 'Two factor confirmed at' })
  @Column({ nullable: true })
  two_factor_confirmed_at: Date;

  @ApiProperty({ description: 'Access token' })
  @Column({ nullable: true })
  access_token: string;

  @ApiProperty({ description: 'Refresh token' })
  @Column({ nullable: true })
  refresh_token: string;

  @ApiProperty({ description: 'When user was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When user was updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When user was deleted' })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_has_role',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @ManyToMany(() => Permission, (permission) => permission.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_has_permission',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }
}
