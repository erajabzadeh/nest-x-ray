import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { DEFAULT_QUEUE_NAME } from '../../constants';
import { XRay, XRaySchema } from './schemas/x-ray.schema';
import { SignalService } from './services/signal.service';
import { SignalCrudService } from './services/signal-crud.service';
import { SignalController } from './controllers/signal.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        url: configService.get(
          'RABBITMQ_URL',
          'amqp://admin:password@localhost:5672',
        ),
        queue: DEFAULT_QUEUE_NAME,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: XRay.name, schema: XRaySchema }]),
  ],
  controllers: [SignalController],
  providers: [SignalService, SignalCrudService],
})
export class SignalModule {}
