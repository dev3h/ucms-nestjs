import { Injectable } from '@nestjs/common';
import { ResponseUtil } from '@/utils/response-util';
import { I18nService } from 'nestjs-i18n';
import { Subsystem } from './entities/subsystem.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubSystemFilter } from './filters/subsystem.filter';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { SubSystemDto } from './dto/subsystem.dto';
import { BaseService } from '@/share/base-service/base.service';
import { System } from '../system/entities/system.entity';
import { Module } from '../module/entities/module.entity';
import { ModuleDto } from '../module/dto/module.dto';

@Injectable()
export class SubsystemService extends BaseService<Subsystem> {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Subsystem)
    private subsystemRepository: Repository<Subsystem>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(System)
    private systemRepository: Repository<System>,
    private readonly subsystemFilter: SubSystemFilter,
  ) {
    super(subsystemRepository);
  }
  async store(body) {
    try {
      const system = await this.systemRepository.findOne({
        where: { id: body.systemId },
      });

      if (!system) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      const subsystem = this.subsystemRepository.create({
        ...body,
        system: system,
      });
      await this.subsystemRepository.save(subsystem);
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
      const query = this.subsystemRepository.createQueryBuilder('subsystem');
      this.subsystemFilter.applyFilters(query);
      query.leftJoinAndSelect('subsystem.system', 'system');
      query.leftJoinAndSelect('subsystem.modules', 'modules');
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

  async findOne(id: number) {
    try {
      const subsystem = await this.subsystemRepository.findOne({
        where: { id },
        relations: ['system'],
      });
      if (!subsystem) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
      }
      const formattedData = new SubSystemDto(subsystem);
      return ResponseUtil.sendSuccessResponse({ data: formattedData });
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
      const subsystem = this.subsystemRepository.findOne({
        where: { id },
      });
      if (!subsystem) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      if (body.system_id) {
        const system = await this.systemRepository.findOne({
          where: { id: body.system_id },
        });
        if (!system) {
          return ResponseUtil.sendErrorResponse(
            this.i18n.t('message.System-not-found', {
              lang: 'vi',
            }),
          );
        }
        body.system = system;
        delete body.system_id;
      }
      this.subsystemRepository.update(id, body);
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

  async remove(id: number) {
    try {
      const subsystem = await this.subsystemRepository.findOne({
        where: { id },
      });
      if (!subsystem) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
        );
      }
      await this.softDelete(id);
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

  async getModulesOfSubsystem(subsystemId: number, request: Request) {
    try {
      const query = this.moduleRepository
        .createQueryBuilder('module')
        .innerJoin('subsystems_modules', 'sm', 'sm.module_id = module.id')
        .innerJoin('subsystems', 'sub', 'sub.id = sm.subsystem_id')
        .where('sub.id = :subsystemId', { subsystemId })
        .orderBy('module.created_at', 'DESC')
        .select([
          'module.id',
          'module.name',
          'module.code',
          'module.created_at',
        ]); // Select only necessary fields
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

  async getRestModulesOfSubsystem(subsystemId: number, request: Request) {
    try {
      const subsystem = await this.subsystemRepository.findOne({
        where: { id: subsystemId },
        relations: ['modules'],
      });
      if (!subsystem) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
      }
      const modules = await this.moduleRepository.find();
      const restModules = modules.filter((module) => {
        return !subsystem.modules.find((m) => m.id === module.id);
      });
      const formattedData = ModuleDto.mapFromEntities(restModules);
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

  async addModulesToSubsystem(subsystemId: number, moduleIds: number[]) {
    try {
      const subsystem = await this.subsystemRepository.findOne({
        where: { id: subsystemId },
        relations: ['modules'],
      });
      if (!subsystem) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
      }
      const modules = await this.moduleRepository.findBy({
        id: In(moduleIds),
      });
      subsystem.modules = [...subsystem.modules, ...modules];
      await this.subsystemRepository.save(subsystem);

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

  async removeModuleFromSubsystem(subsystemId: number, moduleId: number) {
    try {
      const subsystem = await this.subsystemRepository.findOne({
        where: { id: subsystemId },
        relations: ['modules'],
      });
      if (!subsystem) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
      }
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
      });
      if (!module) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
      }
      subsystem.modules = subsystem.modules.filter((m) => m.id !== moduleId);
      await this.subsystemRepository.save(subsystem);
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
