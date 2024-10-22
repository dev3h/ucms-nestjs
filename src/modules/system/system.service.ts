import { Injectable } from '@nestjs/common';
import { UpdateSystemDto } from './dto/update-system.dto';
import { System } from './entities/system.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUtil } from '@/utils/response-util';
import { SystemDto } from './dto/system.dto';
import { SystemFilter } from './filters/system.filter';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { v4 as uuidv4 } from 'uuid';
import { I18nService } from 'nestjs-i18n';
import { SystemDetailDto } from './dto/system-detail.dto';
import { SystemClientSecret } from '../system-client-secret/entities/system-client-secret.entity';

@Injectable()
export class SystemService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
    @InjectRepository(SystemClientSecret)
    private readonly clientSecretRepository: Repository<SystemClientSecret>,
    private readonly systemFilter: SystemFilter,
  ) {}
  async store(body) {
    try {
      let client_id: string;
      let client_secret: string;
      let isUnique = false;

      while (!isUnique) {
        client_id = uuidv4();
        client_secret = uuidv4();

        const existingSystem = await this.systemsRepository.findOne({
          where: { client_id },
        });

        const existingClientSecret = await this.clientSecretRepository.findOne({
          where: { client_secret },
        });

        if (!existingSystem && !existingClientSecret) {
          isUnique = true;
        }
      }

      const system = this.systemsRepository.create({
        ...body,
        client_id,
      });

      await this.systemsRepository.save(system);

      const clientSecretEntity = this.clientSecretRepository.create({
        client_secret: client_secret,
        system: system,
``      });

      await this.clientSecretRepository.save(clientSecretEntity);
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

  async checkClientIdAndRedirectUri(data: any) {
    const system = await this.systemsRepository.findOne({
      where: { client_id: data.client_id },
    });

    if (!system) {
      const errorMessage = encodeURIComponent(
        this.i18n.t('message.Invalid-client_id', {
          lang: 'vi',
        }),
      );
      return ResponseUtil.sendErrorResponse(errorMessage, 'INVALID_CLIENT_ID');
    }

    const isValidRedirectUri = system.redirect_uris.includes(data.redirect_uri);
    if (!isValidRedirectUri) {
      const errorMessage = encodeURIComponent(
        this.i18n.t('message.Invalid-redirect_uri', {
          lang: 'vi',
        }),
      );
      return ResponseUtil.sendErrorResponse(
        errorMessage,
        'INVALID_REDIRECT_URI',
      );
    }

    return ResponseUtil.sendSuccessResponse({ data: system });
  }

  async findAll(request: Request) {
    try {
      const query = this.systemsRepository.createQueryBuilder('system');
      this.systemFilter.applyFilters(query);

      query.orderBy('system.created_at', 'DESC');
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
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  async findOne(id: number) {
    try {
      const system = await this.systemsRepository.findOne({
        where: { id },
        relations: [
          'clientSecrets',
          'subsystems',
          'subsystems.modules',
          'subsystems.modules.actions',
        ],
      });
      if (!system) {
        return ResponseUtil.sendErrorResponse('System not found', 'NOT_FOUND');
      } else {
        const formattedData = new SystemDetailDto(system);
        return ResponseUtil.sendSuccessResponse({ data: formattedData });
      }
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Something-went-wrong', {
          lang: 'vi',
        }),
        error.message,
      );
    }
  }

  update(id: number, updateSystemDto: UpdateSystemDto) {
    return `This action updates a #${id} system`;
  }

  remove(id: number) {
    return `This action removes a #${id} system`;
  }
}
