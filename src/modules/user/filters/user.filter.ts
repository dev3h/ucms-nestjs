import { Injectable, Inject } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UserFilter {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  applyFilters(query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    const { search, created_at, type, role_id } = this.request.query;

    if (search) {
      query.andWhere('user.name LIKE :search', { search: `%${search}%` });
    }

    if (created_at) {
      query.andWhere('DATE(user.created_at) = :created_at', { created_at });
    }

    if (type) {
      query.andWhere('user.type = :type', { type });
    }

    if (role_id) {
      query
        .innerJoin('user.roles', 'unique_role')
        .andWhere('unique_role.id = :role_id', { role_id });
    }

    return query;
  }
}
