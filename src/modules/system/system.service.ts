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
import { BaseService } from '@/share/base-service/base.service';

@Injectable()
export class SystemService extends BaseService<System> {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
    @InjectRepository(SystemClientSecret)
    private readonly clientSecretRepository: Repository<SystemClientSecret>,
    private readonly systemFilter: SystemFilter,
  ) {
    super(systemsRepository);
  }
  async createClientSecret(system: System, clientSecret: string) {
    const clientSecretEntity = this.clientSecretRepository.create({
      client_secret: clientSecret,
      system: system,
    });

    // Save the client secret entity
    await this.clientSecretRepository.save(clientSecretEntity);

    return clientSecretEntity;
  }

  async storeClientSecret(systemId: number) {
    try {
      const system = await this.systemsRepository.findOne({
        where: { id: systemId },
      });

      if (!system) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
      }

      const client_secret = uuidv4();

      await this.createClientSecret(system, client_secret);

      return ResponseUtil.sendSuccessResponse(
        null,
        this.i18n.t('message.Created-successfully', {
          lang: 'vis',
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

  async updateClientSecret(systemId: number, clientSecretId: number) {
    const system = await this.systemsRepository.findOne({
      where: { id: systemId },
    });

    if (!system) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Data-not-found', {
          lang: 'vi',
        }),
        'NOT_FOUND',
      );
    }

    const clientSecret = await this.clientSecretRepository.findOne({
      where: {
        id: clientSecretId,
        system: {
          id: systemId,
        },
      },
    });

    if (!clientSecret) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Data-not-found', {
          lang: 'vi',
        }),
        'CLIENT_SECRET_NOT_FOUND',
      );
    }
    const allClientSecrets = await this.clientSecretRepository.find({
      where: {
        system: {
          id: systemId,
        },
      },
    });
    if (allClientSecrets.length === 1 && clientSecret.is_enabled) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Cannot-disable-only-client-secret', {
          lang: 'vi',
        }),
        'NOT_ALLOWED',
      );
    } else if (allClientSecrets.length > 1) {
      const enabledClientSecrets = allClientSecrets.filter(
        (clientSecret) => clientSecret.is_enabled,
      );
      if (enabledClientSecrets.length === 1 && clientSecret.is_enabled) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.At-least-one-client-secret-enabled', {
            lang: 'vi',
          }),
          'NOT_ALLOWED',
        );
      }
    }

    clientSecret.is_enabled = !clientSecret.is_enabled;
    await this.clientSecretRepository.save(clientSecret);

    return ResponseUtil.sendSuccessResponse(
      null,
      this.i18n.t('message.Updated-successfully', {
        lang: 'vi',
      }),
    );
  }

  async deleteClientSecret(systemId: number, systemClientSecretId: number) {
    const system = await this.systemsRepository.findOne({
      where: { id: systemId },
    });

    if (!system) {
      return ResponseUtil.sendErrorResponse('System not found', 'NOT_FOUND');
    }

    const clientSecret = await this.clientSecretRepository.findOne({
      where: {
        id: systemClientSecretId,
        system: {
          id: systemId,
        },
      },
    });

    if (!clientSecret) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Data-not-found', {
          lang: 'vi',
        }),
        'CLIENT_SECRET_NOT_FOUND',
      );
    }
    if (clientSecret?.is_enabled) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.Only-delete-disabled-client-secret', {
          lang: 'vi',
        }),
        'NOT_ALLOWED',
      );
    }
    await this.clientSecretRepository.update(
      { id: systemClientSecretId },
      { deleted_at: new Date() },
    );

    return ResponseUtil.sendSuccessResponse(
      null,
      this.i18n.t('message.Deleted-successfully', {
        lang: 'vi',
      }),
    );
  }

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

      const system = await this.systemsRepository.save(
        this.systemsRepository.create({
          ...body,
          client_id,
        }),
      );

      const singleSystem = Array.isArray(system) ? system[0] : system;

      await this.createClientSecret(singleSystem, client_secret);

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
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
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

  update(id: number, body) {
    try {
      const system = this.systemsRepository.findOne({
        where: { id },
      });
      if (!system) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
        );
      }

      this.systemsRepository.update({ id }, body);

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
      const system = this.systemsRepository.findOne({
        where: { id },
      });
      if (!system) {
        return ResponseUtil.sendErrorResponse(
          this.i18n.t('message.Data-not-found', {
            lang: 'vi',
          }),
          'NOT_FOUND',
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
}
