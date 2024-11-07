import { Injectable, Inject } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class SubSystemFilter {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  applyFilters(query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    const { search, created_at } = this.request.query;

    if (search) {
      query.andWhere(
        'subsystem.name LIKE :search OR subsystem.code LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    if (created_at) {
      query.andWhere('DATE(subsystem.created_at) = :created_at', {
        created_at,
      });
    }

    return query;
  }
}