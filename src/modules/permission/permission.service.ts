import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Request } from 'express';
import { paginate } from '@/utils/pagination.util';
import { PermissionDto } from './dto/permission.dto';
import { ResponseUtil } from '@/utils/response-util';
import { PermissionFilter } from './filters/permission.filter';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly permissionFilter: PermissionFilter,
  ) {}
  create(createPermissionDto: CreatePermissionDto) {
    return 'This action adds a new permission';
  }

  async findAll(request: Request) {
    try {
      const query = this.permissionRepository.createQueryBuilder('permission');

      this.permissionFilter.applyFilters(query);

      let formattedData;
      let meta = null;

      if (!request.query.noPagination) {
        const page = parseInt(request.query.page as string, 10) || 1;
        const limit = parseInt(request.query.limit as string, 10) || 10;
        const baseUrl = `${request.protocol}://${request.get('host')}${request.baseUrl}`;
        const paginationResult = await paginate(query, page, limit, baseUrl);
        formattedData = PermissionDto.mapFromEntities(paginationResult.data);
        meta = paginationResult.meta;
      } else {
        const data = await query.getMany();
        formattedData = PermissionDto.mapFromEntities(data);
      }

      return ResponseUtil.sendSuccessResponse({
        data: formattedData,
        meta: meta,
      });
    } catch (error) {
      return ResponseUtil.sendErrorResponse(
        'Something went wrong',
        error.message,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
