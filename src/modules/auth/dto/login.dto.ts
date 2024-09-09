import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsEmailExists } from './is-email-exists.validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'reachme@amitavroy.com',
  })
  // @IsEmailExists()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'Password@123',
  })
  @Matches(/^[0-9a-zA-Z!"#$%&'()-^\\@\[;:\],.\/=~|`{+*}<>?_]+$/)
  @Length(8, 16)
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
