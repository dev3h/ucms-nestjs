import { IsString, MinLength } from 'class-validator';

export class UpdateResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  password: string;
}
