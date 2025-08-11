import { inspect } from 'node:util';
import pMap from 'p-map';
import { Model } from 'mongoose';
import { Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  RabbitMQChannel,
  type XRayPayload,
} from '../../rabbitmq/providers/rabbitmq-channel.provider';
import { XRay } from '../schemas/x-ray.schema';

export class SignalService implements OnModuleInit {
  private readonly logger = new Logger(SignalService.name);

  constructor(
    private readonly channel: RabbitMQChannel,
    @InjectModel(XRay.name) private readonly xrayModel: Model<XRay>,
  ) {}

  onModuleInit() {
    this.channel.consume(async (payload) => {
      await pMap(this.transform(payload), (xray) => this.upsert(xray), {
        concurrency: 5,
      });
    });
  }

  async upsert(xray: XRay) {
    this.logger.debug(`Saving x-ray document ${inspect(xray, false, null)}`);
    try {
      await this.xrayModel.updateOne(
        { deviceId: xray.deviceId, time: xray.time },
        { $set: xray },
        { upsert: true },
      );
    } catch (err) {
      this.logger.error('Error saving x-ray document', err);
    }
  }

  transform(payload: XRayPayload): XRay[] {
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
