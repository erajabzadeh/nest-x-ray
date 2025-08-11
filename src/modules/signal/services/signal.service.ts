import { Model } from 'mongoose';
import { Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { inspect } from 'node:util';
import * as Rx from 'rxjs';

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
    this.channel
      .consumer()
      .pipe(Rx.mergeMap((value) => this.transform(value)))
      .subscribe({
        next: (value) => {
          this.logger.debug(
            `Inserting x-ray document ${inspect(value, false, null)}`,
          );
          void this.upsert(value);
        },
        error: (error) => {
          this.logger.error('Channel error', error);
        },
      });
  }

  async upsert(xray: XRay) {
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
