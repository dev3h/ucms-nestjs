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
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { Exclude } from 'class-transformer';
import { SystemToken } from '../system-token/entities/system-token.entity';
import { UserHasPermission } from './user-has-permission.entity';

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

  @ApiProperty({ description: 'Type of user', example: '1: admin' })
  @Column()
  @Column({
    type: 'tinyint',
    comment: '1: Admin, 2: User',
  })
  type: number;

  @ApiProperty({ description: 'Hashed user password' })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'check user change password first time' })
  @Column({ default: false })
  is_change_password_first: boolean;

  @ApiProperty({ description: 'User status' })
  @Column({
    type: 'tinyint',
    default: 1,
    comment: '1: Active, 2: Suspend, 3: DeActive',
  })
  status: number;

  @ApiProperty({ description: 'token when change password first time' })
  @Column({ nullable: true })
  token_first_time: string;

  @ApiProperty({ description: 'Two factor secret' })
  @Column({ nullable: true })
  @Exclude()
  two_factor_secret: string;

  @ApiProperty({ description: 'Two factor recovery code' })
  @Column({ nullable: true })
  @Exclude()
  two_factor_recovery_code: string;

  @ApiProperty({ description: 'Two factor enable' })
  @Column({ default: false })
  two_factor_enable: boolean;

  @ApiProperty({ description: 'Two factor confirmed at' })
  @Column({ nullable: true })
  two_factor_confirmed_at: Date;

  @ApiProperty({ description: 'Access token' })
  @Column({ nullable: true })
  access_token?: string;

  @ApiProperty({ description: 'Refresh token' })
  @Column({ nullable: true })
  refresh_token: string;

  @ApiProperty({ description: 'When user was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When user was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When user was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_has_roles',
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

  @OneToMany(
    () => UserHasPermission,
    (userHasPermission) => userHasPermission.user,
  )
  userHasPermissions: UserHasPermission[];

  @OneToMany(() => SystemToken, (systemToken) => systemToken.user)
  systemTokens: SystemToken[];

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }
}
