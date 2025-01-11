import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { I18nContext } from 'nestjs-i18n';
import { PasswordStrength } from '@/share/validation/strength/password-strength';

export class UpdatePasswordDto {
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
  readonly old_password: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'a12345678X',
  })
  @PasswordStrength()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: (args) =>
        I18nContext.current().t('validation.password-complexity', {
          args: { column: 'Mật khẩu mới' },
        }),
    },
  )
  @MinLength(8, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Mật khẩu mới', min: 8 },
      }),
  })
  @MaxLength(20, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Mật khẩu mới', max: 20 },
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
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: (args) =>
        I18nContext.current().t('validation.password-complexity', {
          args: { column: 'Mật khẩu xác nhận' },
        }),
    },
  )
  @MinLength(8, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Mật khẩu xác nhận', min: 8 },
      }),
  })
  @MaxLength(20, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Mật khẩu xác nhận', max: 20 },
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
