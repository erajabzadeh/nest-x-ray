import { tags } from 'typia';

export interface Page<T> {
  data: T[];
  pagination: Pagination;
}

export interface PageQuery {
  page?: number & tags.Type<'uint32'>;
  limit?: number & tags.Type<'uint32'>;
}

export interface Pagination {
  current: number & tags.Type<'uint32'>;
  limit: number & tags.Type<'uint32'>;
  records: number & tags.Type<'uint32'>;
  pages: number & tags.Type<'uint32'>;
}
