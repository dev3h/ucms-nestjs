import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'password_reset_tokens' })
export class PasswordResetToken extends BaseEntity {
  @ApiProperty({ description: 'email of user' })
  @Column()
  @PrimaryColumn()
  email: string;

  @ApiProperty({ description: 'token for reset password' })
  @Column()
  token: string;

  @ApiProperty({ description: 'otp code' })
  @Column({ nullable: true })
  otp_code: string;

  @ApiProperty({ description: 'Phone number' })
  @Column({ nullable: true })
  phone_number: string;
}
