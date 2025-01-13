import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class CreateModuleDto {
  @ApiProperty({ description: 'Module name', example: 'Main Module' })
  @MinLength(2, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Tên', min: 2 },
      }),
  })
  @MaxLength(100, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Tên', max: 100 },
      }),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly name: string;

  @ApiProperty({ description: 'Module code', example: 'MOD_001' })
  @IsUnique({ tableName: 'modules', column: 'code' })
  @MinLength(3, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Mã', min: 3 },
      }),
  })
  @MaxLength(50, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Mã', max: 50 },
      }),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly code: string;
}
