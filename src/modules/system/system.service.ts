import { Injectable } from '@nestjs/common';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { System } from './entities/system.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUtil } from '@/utils/response-util';
import { SystemDto } from './dto/system.dto';
import { SystemFilter } from './filters/system.filter';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
    private readonly systemFilter: SystemFilter,
  ) {}
  create(createSystemDto: CreateSystemDto) {
    return 'This action adds a new system';
  }

  async findAll(request: Request) {
    try {
      const query = this.systemsRepository.createQueryBuilder('system');
      this.systemFilter.applyFilters(query);

      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 10;
      const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
      const paginationResult = await paginate(query, page, limit, baseUrl);

      const formattedData = SystemDto.mapFromEntities(paginationResult.data);
      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
        meta: paginationResult.meta,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
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
