import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { IsEmailExists } from '../../dto/is-email-exists.validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user to reset password',
    example: 'reachme@amitavroy.com',
  })
  @IsEmailExists({ message: 'Email does not exist' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
