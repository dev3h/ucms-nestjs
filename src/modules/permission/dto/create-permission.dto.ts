import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission code',
    example: 'HT01-PH01-MODULE01-TT01',
  })
  @IsUnique({ tableName: 'permissions', column: 'code' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly code: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'description',
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly description: string;
}
