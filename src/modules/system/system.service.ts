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

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
    private readonly systemFilter: SystemFilter,
  ) {}
  async create(body) {
    try {
      let client_id: string;
      let client_secret: string;
      let isUnique = false;

      while (!isUnique) {
        client_id = uuidv4();
        client_secret = uuidv4();

        const existingSystem = await this.systemsRepository.findOne({
          where: [{ client_id }, { client_secret }],
        });

        if (!existingSystem) {
          isUnique = true;
        }
      }

      const system = this.systemsRepository.create({
        ...body,
        client_id,
        client_secret,
      });

      await this.systemsRepository.save(system);
      return ResponseUtil.sendSuccessResponse(null, 'Created successfully');
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  async checkClientIdAndRedirectUri(data: any) {
    try {
      const system = await this.systemsRepository.findOne({
        where: { client_id: data.client_id, redirect_uris: data.redirect_uri },
      });

      if (!system) {
        return ResponseUtil.sendSuccessResponse({ data: null });
      }

      return ResponseUtil.sendSuccessResponse({ data: system });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
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
