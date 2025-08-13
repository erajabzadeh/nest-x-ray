import { inspect } from 'node:util';
import pMap from 'p-map';
import { Model } from 'mongoose';
import { Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { XRay } from '../schemas/x-ray.schema';
import {
  RabbitMQService,
  type XRayPayload,
} from '../../rabbitmq/services/rabbitmq.service';

export class SignalService implements OnModuleInit {
  private readonly logger = new Logger(SignalService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    @InjectModel(XRay.name) private readonly xrayModel: Model<XRay>,
  ) {}

  onModuleInit() {
    this.rabbitMQService.consume((payload) => this.processXRayMessage(payload));
  }

  private async processXRayMessage(payload: XRayPayload) {
    const xrays = this.transform(payload);
    await pMap(xrays, (xray) => this.upsert(xray), { concurrency: 5 });
  }

  async upsert(xray: XRay) {
    if (!xray.deviceId?.trim()) {
      throw new Error('Invalid deviceId');
    }
    if (!Number.isSafeInteger(xray.time) || xray.time <= 0) {
      throw new Error('Invalid time');
    }

    this.logger.debug(`Saving x-ray document ${inspect(xray, false, null)}`);
    try {
      const result = await this.xrayModel.updateOne(
        { deviceId: xray.deviceId, time: xray.time },
        { $set: xray },
        { upsert: true },
      );
      return result.upsertedCount;
    } catch (err) {
      this.logger.error('Error saving x-ray document', err);
    }
  }

  transform(payload: Readonly<XRayPayload>): XRay[] {
    const records = Object.entries(payload).map(
      ([deviceId, { data, time }]) => ({
        deviceId,
        dataLength: data?.length,
        dataVolume: data,
        time,
      }),
    );
    return records;
  }
}
