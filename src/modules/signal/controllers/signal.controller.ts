import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';

import { SignalCrudService } from '../services/signal-crud.service';
import type { Page } from '../dtos/pagination.dto';
import type {
  CreateXRayDto,
  UpdateXRayDto,
  XRayDto,
  XRayListQueryDto,
} from '../dtos/signal.dto';
import type { ObjectId } from '../types';

@Controller('signals')
export class SignalController {
  constructor(private readonly signalCrudService: SignalCrudService) {}

  @TypedRoute.Get()
  async listSignals(
    @TypedQuery() query: Partial<XRayListQueryDto>,
  ): Promise<Page<XRayDto>> {
    const { page, limit, ...filters } = query;
    return await this.signalCrudService.getPage(page, limit, filters);
  }

  @TypedRoute.Get(':id')
  async getSignal(@TypedParam('id') id: ObjectId) {
    return await this.signalCrudService.getOne(id);
  }

  @TypedRoute.Post()
  async createSignal(@TypedBody() createDto: CreateXRayDto) {
    return await this.signalCrudService.create(createDto);
  }

  @TypedRoute.Patch(':id')
  async updateSignal(
    @TypedParam('id') id: ObjectId,
    @TypedBody() updateDto: UpdateXRayDto,
  ) {
    return await this.signalCrudService.update(id, updateDto);
  }

  @TypedRoute.Delete(':id')
  async deleteSignal(@TypedParam('id') id: ObjectId) {
    await this.signalCrudService.delete(id);
  }
}
