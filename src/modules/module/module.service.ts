import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Module } from './entities/module.entity';
import { In, Repository } from 'typeorm';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { ResponseUtil } from '@/utils/response-util';
import { ModuleFilter } from './filters/module.filter';
import { ModuleDto } from './dto/module.dto';
import { BaseService } from '@/share/base-service/base.service';
import { Action } from '../action/entities/action.entity';

@Injectable()
export class ModuleService extends BaseService<Module> {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    private readonly moduleFilter: ModuleFilter,
  ) {
    super(moduleRepository);
  }
  async store(body) {
    try {
      await this.moduleRepository.save(body);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Created-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
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

  async findOne(id: number) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id },
      });
      if (!module) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      const formattedData = new ModuleDto(module);
      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
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

  async update(id: number, body) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id },
      });
      if (!module) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.data-not-found', {
            lang: 'vi',
          }),
        );
      }
      this.moduleRepository.update(id, body);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Updated-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  remove(id: number) {
    try {
      const module = this.moduleRepository.findOne({
        where: { id },
      });
      if (!module) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      this.softDelete(id);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Deleted-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async getActionsOfModule(moduleId: number) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
        relations: ['actions'],
      });
      if (!module) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      return ResponseUtil.sendSuccessResponse({
        data: module.actions,
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

  async addActionsToModule(moduleId: number, actionIds: number[]) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
        relations: ['actions'],
      });
      if (!module) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      const actions = await this.actionRepository.findBy({
        id: In(actionIds),
      });
      module.actions = actions;
      await this.moduleRepository.save(module);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Updated-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async removeActionFromModule(moduleId: number, actionId: number) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
        relations: ['actions'],
      });
      if (!module) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      module.actions = module.actions.filter(
        (action) => action.id !== actionId,
      );
      await this.moduleRepository.save(module);
      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Updated-successfully', {
          lang: 'vi',
        }),
      );
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }
}
