import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';

import { DEFAULT_API_PAGE_SIZE } from '../../../constants';
import {
  CreateXRayDto,
  UpdateXRayDto,
  XRayDto,
  XRayFilterQueryDto,
} from '../dtos/signal.dto';
import {
  type PersistedXRay,
  XRay,
  XRayDocument,
} from '../schemas/x-ray.schema';
import type { Page } from '../dtos/pagination.dto';

@Injectable()
export class SignalCrudService {
  constructor(
    @InjectModel(XRay.name) private readonly xrayModel: Model<XRay>,
  ) {}

  async getPage(
    page: number | undefined,
    limit: number | undefined,
    filters: XRayFilterQueryDto,
  ): Promise<Page<XRayDto>> {
    page ??= 1;
    limit ??= DEFAULT_API_PAGE_SIZE;
    const skip = Math.min(
      (Math.max(page, 1) - 1) * limit,
      Number.MAX_SAFE_INTEGER,
    );

    const query: RootFilterQuery<XRayDocument> = {};
    if (filters?.deviceId) {
      query.deviceId = filters.deviceId;
    }
    if (Number.isSafeInteger(filters?.before)) {
      query.time = {
        $lt: filters.before,
      };
    }
    if (Number.isSafeInteger(filters?.after)) {
      query.time = {
        $gte: filters.after,
      };
    }

    const [xrays, count] = await Promise.all([
      this.xrayModel
        .find(
          query,
          {},
          {
            limit,
            skip,
          },
        )
        .sort({
          time: 1,
          deviceId: 1,
        })
        .lean(),
      this.xrayModel.countDocuments(query),
    ]);

    const data = xrays.map((xray) => this.toDto(xray));
    const pages = Math.ceil(count / limit);

    return {
      data,
      pagination: {
        current: page,
        limit,
        pages,
        records: count,
      },
    };
  }

  async getOne(id: string) {
    const xray = await this.xrayModel
      .findOne({
        _id: id,
      })
      .lean();
    if (!xray) {
      throw new NotFoundException();
    }

    return this.toDto(xray);
  }

  async create(data: CreateXRayDto) {
    const xray = await this.xrayModel.create({
      ...data,
      dataLength: data.dataVolume?.length ?? 0,
    });

    return this.toDto(xray);
  }

  async update(id: string, data: UpdateXRayDto) {
    // exclude undefined values, allow null values
    data = Object.fromEntries(
      Object.entries(data).filter(([, v]) => typeof v !== 'undefined'),
    );

    const xray = await this.xrayModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          ...data,
          dataLength: data.dataVolume?.length ?? 0,
        },
        {
          new: true,
        },
      )
      .lean();
    if (!xray) {
      throw new NotFoundException();
    }

    return this.toDto(xray);
  }

  async delete(id: string) {
    const xray = await this.xrayModel.findOneAndDelete({
      _id: id,
    });
    if (!xray) {
      throw new NotFoundException();
    }

    return true;
  }

  private toDto(xray: PersistedXRay): XRayDto {
    return {
      id: xray._id.toString(),
      deviceId: xray.deviceId,
      time: xray.time,
      dataLength: xray.dataLength,
      dataVolume: xray.dataVolume,
    };
  }
}
