import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'Role 1' })
  @Matches(/^[\p{L}\p{N} _-]+$/u, {
    message: (args) => I18nContext.current().t('validation.invalidCharacters'),
  })
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

  @ApiProperty({ description: 'Role code', example: 'ROLE1' })
  @IsUnique({ tableName: 'systems', column: 'code' })
  @MinLength(3, {
    message: (args) =>
      I18nContext.current().t('validation.minLength', {
        args: { column: 'Mã', min: 3 },
      }),
  })
  @MaxLength(10, {
    message: (args) =>
      I18nContext.current().t('validation.maxLength', {
        args: { column: 'Mã', max: 10 },
      }),
  })
  //   @Matches(/^[A-Z]{2}[0-9]+$/, {
  //     message: (args) =>
  //       I18nContext.current().t('validation.invalidFormat', {
  //         args: { column: 'Mã' },
  //       }),
  //   })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly code: string;
}
