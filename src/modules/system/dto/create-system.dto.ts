import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class CreateSystemDto {
  @ApiProperty({ description: 'System name', example: 'Main System' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly name: string;

  @ApiProperty({ description: 'System code', example: 'HT01' })
  @IsUnique({ tableName: 'systems', column: 'code' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly code: string;

  @ApiProperty({ description: 'Redirect URIs', type: [String] })
  @IsUrl(
    {},
    {
      each: true,
      message: (args) => I18nContext.current().t('validation.url'),
    },
  )
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly redirect_uris: string[];
}
