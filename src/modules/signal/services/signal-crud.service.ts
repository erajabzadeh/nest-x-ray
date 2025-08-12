import { Injectable } from '@nestjs/common';
import { XRay } from '../schemas/x-ray.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SignalCrudService {
  constructor(
    @InjectModel(XRay.name) private readonly xrayModel: Model<XRay>,
  ) {}

  async findAll() {
    return await this.xrayModel.find();
  }

  async getOne(id: string) {
    return await this.xrayModel.findOne({
      id,
    });
  }

  async create(xray: XRay) {
    await this.xrayModel.create(xray);
  }

  async delete(id: string) {
    await this.xrayModel.deleteOne({
      id,
    });
  }
}
