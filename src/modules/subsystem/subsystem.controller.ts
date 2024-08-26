import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubsystemService } from './subsystem.service';
import { CreateSubsystemDto } from './dto/create-subsystem.dto';
import { UpdateSubsystemDto } from './dto/update-subsystem.dto';

@Controller('subsystem')
export class SubsystemController {
  constructor(private readonly subsystemService: SubsystemService) {}

  @Post()
  create(@Body() createSubsystemDto: CreateSubsystemDto) {
    return this.subsystemService.create(createSubsystemDto);
  }

  @Get()
  findAll() {
    return this.subsystemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subsystemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubsystemDto: UpdateSubsystemDto,
  ) {
    return this.subsystemService.update(+id, updateSubsystemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subsystemService.remove(+id);
  }
}
