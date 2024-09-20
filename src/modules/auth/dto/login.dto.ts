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
    example: 'namnd@yopmail.com',
  })
  // @IsEmailExists()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsEmail()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'a12345678X',
  })
  @Matches(/^[0-9a-zA-Z!"#$%&'()-^\\@\[;:\],.\/=~|`{+*}<>?_]+$/)
  @Length(8, 16)
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
