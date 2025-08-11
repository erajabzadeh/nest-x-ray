import Rx from 'rxjs';
import { RabbitMQChannel } from '../../rabbitmq/providers/rabbitmq-channel.provider';
import { InjectModel } from '@nestjs/mongoose';
import { XRay } from '../schemas/x-ray.schema';
import { Model } from 'mongoose';
import { OnModuleInit } from '@nestjs/common';

export class SignalService implements OnModuleInit {
  constructor(
    private readonly channel: RabbitMQChannel,
    @InjectModel(XRay.name) private readonly xrayModel: Model<XRay>,
  ) {}

  onModuleInit() {
    // this.channel
    //   .consumer()
    //   .subscribe()
  }
}
