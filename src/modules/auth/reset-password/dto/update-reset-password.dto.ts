import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class UpdateResetPasswordDto {
  @ApiProperty({
    description: 'Password in plain text',
    example: 'a12345678X',
  })
  @Matches(/^[0-9a-zA-Z!"#$%&'()-^\\@\[;:\],.\/=~|`{+*}<>?_]+$/)
  @MinLength(8, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Password', min: 8 },
      }),
  })
  @MaxLength(20, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Password', max: 20 },
      }),
  })
  @IsString({
    message: (args) => I18nContext.current().t('validation.password'),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly password: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'a12345678X',
  })
  @Matches(/^[0-9a-zA-Z!"#$%&'()-^\\@\[;:\],.\/=~|`{+*}<>?_]+$/)
  @MinLength(8, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Password', min: 8 },
      }),
  })
  @MaxLength(20, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Password', max: 20 },
      }),
  })
  @IsString({
    message: (args) => I18nContext.current().t('validation.password'),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly password_confirmation: string;
}
