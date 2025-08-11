import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { XRay, XRaySchema } from './schemas/x-ray.schema';
import { SignalService } from './services/signal.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule.register({
      url: 'amqp://admin:password@localhost:5672',
      queue: 'x_ray',
    }),
    MongooseModule.forFeature([{ name: XRay.name, schema: XRaySchema }]),
  ],
  providers: [SignalService],
})
export class SignalModule {}
