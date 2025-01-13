import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsNotEmpty,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class CreateSystemDto {
  @ApiProperty({ description: 'System name', example: 'Main System' })
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

  @ApiProperty({ description: 'System code', example: 'HT01' })
  @IsUnique({ tableName: 'systems', column: 'code' })
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
  // @Matches(/^[A-Z]{2}[0-9]+$/, {
  //   message: (args) =>
  //     I18nContext.current().t('validation.invalidFormat', {
  //       args: { column: 'Mã' },
  //     }),
  // })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly code: string;

  @ApiProperty({ description: 'Redirect URIs', type: [String] })
  @ArrayMaxSize(10, {
    message: (args) =>
      I18nContext.current().t('validation.arrayMaxSize', {
        args: { column: 'Địa chỉ URL chuyển hướng', max: 10 },
      }),
  })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_tld: false, // This allows 'localhost' without a top-level domain
    },
    {
      each: true,
      message: (args) => I18nContext.current().t('validation.url'),
    },
  )
  @ArrayUnique({
    message: (args) =>
      I18nContext.current().t('validation.arrayUnique', {
        args: { column: 'Địa chỉ URL chuyển hướng' },
      }),
  })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly redirect_uris: string[];
}
