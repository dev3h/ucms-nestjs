import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';
import { PasswordStrength } from '@/share/validation/strength/password-strength';

export class CreateUserDto {
  @ApiProperty({ description: 'Name', example: 'Anka' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'reachme@amitavroy.com',
  })
  @IsUnique({ tableName: 'users', column: 'email' })
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
    description: 'Phone number',
    example: '0123456789',
  })
  @IsUnique({ tableName: 'users', column: 'phone_number' })
  @Matches(/^[0-9]{10,11}$/)
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly phone_number: string;

  @ApiProperty({ description: 'Password', example: '123456' })
  @PasswordStrength()
  @Matches(/^[0-9a-zA-Z!"#$%&'()-^\\@\[;:\],.\/=~|`{+*}<>?_]+$/)
  @Length(8, 16, {
    message: (args) =>
      I18nContext.current().t('validation.length', {
        args: { min: 8, max: 16 },
      }),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly password: string;

  @ApiProperty({ description: 'Role id', example: 1 })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly role_id: number;

  @ApiProperty({ description: 'Type of user', example: '1: admin' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly type: number;

  @ApiProperty({ description: 'Two factor enable' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly two_factor_enable: boolean;
}
