import { Injectable } from '@nestjs/common';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { Repository } from 'typeorm';
import { ActionFilter } from './filters/action.filter';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { ResponseUtil } from '@/utils/response-util';
import { ActionDto } from './dto/action.dto';

@Injectable()
export class ActionService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    private readonly actionFilter: ActionFilter,
  ) {}
  create(createActionDto: CreateActionDto) {
    return 'This action adds a new action';
  }

  async findAll(request: Request) {
    try {
      const query = this.actionRepository.createQueryBuilder('action');
      this.actionFilter.applyFilters(query);

      query.orderBy('action.created_at', 'DESC');
      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 10;
      const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
      const paginationResult = await paginate(query, page, limit, baseUrl);

      const formattedData = ActionDto.mapFromEntities(paginationResult.data);
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
    return `This action returns a #${id} action`;
  }

  update(id: number, updateActionDto: UpdateActionDto) {
    return `This action updates a #${id} action`;
  }

  remove(id: number) {
    return `This action removes a #${id} action`;
  }
}
