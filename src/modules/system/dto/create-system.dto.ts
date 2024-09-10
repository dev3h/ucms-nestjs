import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSystemDto {
  @ApiProperty({ description: 'System name', example: 'Main System' })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: 'System code', example: 'SYS_001' })
  @IsNotEmpty()
  readonly code: string;
}
