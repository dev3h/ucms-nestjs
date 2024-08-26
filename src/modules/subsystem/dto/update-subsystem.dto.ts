import { PartialType } from '@nestjs/swagger';
import { CreateSubsystemDto } from './create-subsystem.dto';

export class UpdateSubsystemDto extends PartialType(CreateSubsystemDto) {}
