import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class SSOResetPasswordDto {
  @ApiProperty({
    description: 'Phone number',
    example: '0123456789',
  })
  @Matches(/^[0-9]{10,11}$/, {
    message: (args) => I18nContext.current().t('validation.phone'),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly phone_number: string;
}
