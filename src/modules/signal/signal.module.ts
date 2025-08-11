import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { XRay, XRaySchema } from './schemas/x-ray.schema';
import { SignalService } from './services/signal.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { DEFAULT_QUEUE } from '../../constants';

@Module({
  imports: [
    RabbitMQModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        url: configService.get(
          'RABBITMQ_URL',
          'amqp://admin:password@localhost:5672',
        ),
        queue: DEFAULT_QUEUE,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: XRay.name, schema: XRaySchema }]),
  ],
  providers: [SignalService],
})
export class SignalModule {}
