import { Injectable } from '@nestjs/common';
import { CreateSubsystemDto } from './dto/create-subsystem.dto';
import { UpdateSubsystemDto } from './dto/update-subsystem.dto';

@Injectable()
export class SubsystemService {
  create(createSubsystemDto: CreateSubsystemDto) {
    return 'This action adds a new subsystem';
  }

  findAll() {
    return `This action returns all subsystem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subsystem`;
  }

  update(id: number, updateSubsystemDto: UpdateSubsystemDto) {
    return `This action updates a #${id} subsystem`;
  }

  remove(id: number) {
    return `This action removes a #${id} subsystem`;
  }
}
