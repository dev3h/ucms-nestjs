import { Injectable } from '@nestjs/common';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { System } from './entities/system.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUtil } from '@/utils/response-util';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
  ) {}
  create(createSystemDto: CreateSystemDto) {
    return 'This action adds a new system';
  }

  async findAll() {
    const data = await this.systemsRepository.find();
    return ResponseUtil.sendSuccessResponse(data);
  }

  findOne(id: number) {
    return `This action returns a #${id} system`;
  }

  update(id: number, updateSystemDto: UpdateSystemDto) {
    return `This action updates a #${id} system`;
  }

  remove(id: number) {
    return `This action removes a #${id} system`;
  }
}
