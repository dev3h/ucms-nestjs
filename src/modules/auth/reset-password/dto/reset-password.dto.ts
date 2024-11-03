import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { IsExists } from '@/share/validation/exist/is-exist';
import { I18nContext } from 'nestjs-i18n';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'namnd@yopmail.com',
  })
  @IsExists({ tableName: 'users', column: 'email' })
  @MaxLength(50, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Email', max: 50 },
      }),
  })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsEmail(
    {},
    { message: (args) => I18nContext.current().t('validation.email') },
  )
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly email: string;
}
