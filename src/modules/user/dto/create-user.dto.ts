import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Name', example: 'Anka' })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'reachme@amitavroy.com',
  })
  @IsUnique(
    { tableName: 'users', column: 'email' },
    { message: 'Email must be unique' },
  )
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'Password', example: '123456' })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ description: 'Role id', example: 1 })
  @IsNotEmpty()
  readonly role_id: number;

  @ApiProperty({ description: 'Type of user', example: '1: admin' })
  @IsNotEmpty()
  readonly type: number;

  @ApiProperty({ description: 'Two factor enable' })
  readonly two_factor_enable: boolean;
}
