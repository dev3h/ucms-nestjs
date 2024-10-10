import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Module } from './entities/module.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { ResponseUtil } from '@/utils/response-util';
import { ModuleFilter } from './filters/module.filter';
import { ModuleDto } from './dto/module.dto';

@Injectable()
export class ModuleService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    private readonly moduleFilter: ModuleFilter,
  ) {}
  create(createModuleDto: CreateModuleDto) {
    return 'This action adds a new module';
  }

  async findAll(request: Request) {
    try {
      const query = this.moduleRepository.createQueryBuilder('module');
      this.moduleFilter.applyFilters(query);

      query.orderBy('module.created_at', 'DESC');
      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 10;
      const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
      const paginationResult = await paginate(query, page, limit, baseUrl);

      const formattedData = ModuleDto.mapFromEntities(paginationResult.data);
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
    return `This action returns a #${id} module`;
  }

  update(id: number, updateModuleDto: UpdateModuleDto) {
    return `This action updates a #${id} module`;
  }

  remove(id: number) {
    return `This action removes a #${id} module`;
  }
}
