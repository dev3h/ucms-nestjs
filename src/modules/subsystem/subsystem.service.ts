import { Injectable } from '@nestjs/common';
import { CreateSubsystemDto } from './dto/create-subsystem.dto';
import { UpdateSubsystemDto } from './dto/update-subsystem.dto';
import { ResponseUtil } from '@/utils/response-util';
import { I18nService } from 'nestjs-i18n';
import { Subsystem } from './entities/subsystem.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubSystemFilter } from './filters/subsystem.filter';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { SubSystemDto } from './dto/subsystem.dto';

@Injectable()
export class SubsystemService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Subsystem)
    private subsystemRepository: Repository<Subsystem>,
    private readonly subsystemFilter: SubSystemFilter,
  ) {}
  create(createSubsystemDto: CreateSubsystemDto) {
    return 'This action adds a new subsystem';
  }

  async findAll(request: Request) {
    try {
      const query = this.subsystemRepository.createQueryBuilder('subsystem');
      this.subsystemFilter.applyFilters(query);

      query.orderBy('subsystem.created_at', 'DESC');
      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 10;
      const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
      const paginationResult = await paginate(query, page, limit, baseUrl);

      const formattedData = SubSystemDto.mapFromEntities(paginationResult.data);
      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
        meta: paginationResult.meta,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
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
