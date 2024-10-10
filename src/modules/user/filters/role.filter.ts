import { Injectable, Inject } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RoleFilter {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  applyFilters(query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    const { search } = this.request.query;

    if (search) {
      query.andWhere('role.name LIKE :search OR role.code LIKE :search', {
        search: `%${search}%`,
      });
    }

    return query;
  }
}
