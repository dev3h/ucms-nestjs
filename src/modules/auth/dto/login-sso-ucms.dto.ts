import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsExists } from '@/share/validation/exist/is-exist';
import { I18nContext } from 'nestjs-i18n';

export class LoginSSOUCMSRequestDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'namnd@yopmail.com',
  })
  @IsExists({ tableName: 'users', column: 'email' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsEmail()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'a12345678X',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: (args) =>
        I18nContext.current().t('validation.password-complexity', {
          args: { column: 'Mật khẩu' },
        }),
    },
  )
  @MinLength(8, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Mật khẩu', min: 8 },
      }),
  })
  @MaxLength(20, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Mật khẩu', max: 20 },
      }),
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
