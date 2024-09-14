import { IsUnique } from '@/share/validation/unique/is-unique';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateSystemDto {
  @ApiProperty({ description: 'System name', example: 'Main System' })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: 'System code', example: 'SYS_001' })
  @IsUnique(
    { tableName: 'systems', column: 'code' },
    { message: 'System code must be unique' },
  )
  @IsNotEmpty()
  readonly code: string;

  @ApiProperty({ description: 'Redirect URI' })
  @IsUrl()
  @IsNotEmpty()
  readonly redirect_uris: string;
}
