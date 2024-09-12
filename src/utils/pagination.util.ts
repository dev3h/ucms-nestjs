import { SelectQueryBuilder } from 'typeorm';

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    from: number;
    to: number;
  };
}

export async function paginate<T>(
  query: SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 10,
  baseUrl: string = '',
): Promise<PaginationResult<T>> {
  const [data, total] = await query
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  const last_page = Math.ceil(total / limit);
  const next_page_url = page < last_page ? `${baseUrl}?page=${page + 1}` : null;
  const prev_page_url = page > 1 ? `${baseUrl}?page=${page - 1}` : null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return {
    data,
    meta: {
      total,
      per_page: limit,
      current_page: page,
      last_page,
      next_page_url,
      prev_page_url,
      from,
      to,
    },
  };
}
