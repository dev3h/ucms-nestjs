import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class CreateSubsystemDto {
  @ApiProperty({ description: 'System name', example: 'Main System' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly name: string;

  @ApiProperty({ description: 'SubSystem code', example: 'SYS_001' })
  @IsUnique({ tableName: 'subsystems', column: 'code' })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly code: string;

  @ApiProperty({ description: 'System id', example: 1 })
  @IsNotEmpty({
    message: (args) => I18nContext.current().t('validation.isNotEmpty'),
  })
  readonly system_id: number;
}
