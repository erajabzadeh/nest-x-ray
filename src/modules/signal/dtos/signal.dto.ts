import { tags } from 'typia';

import { PageQueryDto } from './pagination.dto';
import type { ObjectId } from '../types';

export interface XRayDto {
  id: ObjectId;
  deviceId: string;
  dataLength: number;
  dataVolume: Array<[number, [number, number, number]]>;
  time: number;
}

export type CreateXRayDto = Omit<XRayDto, 'id' | 'dataLength'>;
export type UpdateXRayDto = Partial<CreateXRayDto>;

export interface XRayFilterQueryDto {
  deviceId?: string;
  before?: number & tags.Type<'uint64'> & tags.Minimum<0>;
  after?: number & tags.Type<'uint64'> & tags.Minimum<0>;
}

export type XRayListQueryDto = PageQueryDto & XRayFilterQueryDto;
