import { IsExists } from '@/share/validation/exist/is-exist';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'namnd@yopmail.com',
  })
  @IsExists({ tableName: 'users', column: 'email' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsEmail(
    {},
    { message: (args) => I18nContext.current().t('validation.email') },
  )
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly email: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'a12345678X',
  })
  @Matches(/^[0-9a-zA-Z!"#$%&'()-^\\@\[;:\],.\/=~|`{+*}<>?_]+$/)
  @Length(8, 16, {
    message: (args) =>
      I18nContext.current().t('validation.length', {
        args: { min: 8, max: 16 },
      }),
  })
  @IsString({
    message: (args) => I18nContext.current().t('validation.password'),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly password: string;
}
