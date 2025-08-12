import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SignalCrudService } from '../services/signal-crud.service';

@Controller('signals')
export class SignalController {
  constructor(private readonly signalCrudService: SignalCrudService) {}

  @Get()
  async getSignalsList() {
    return await this.signalCrudService.findAll();
  }

  @Get()
  async getSignalDetails(@Param('id') id: string) {
    return await this.signalCrudService.getOne(id);
  }

  @Post()
  async createSignal(@Body() createDto: any) {
    return await this.signalCrudService.create(createDto);
  }

  @Patch()
  updateSignal() {}

  @Delete()
  deleteSignal() {}
}
