import { Module } from '@nestjs/common';
import { RabbitMQChannel } from '../rabbitmq/providers/rabbitmq-channel.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { XRay, XRaySchema } from './schemas/x-ray.schema';
import { SignalService } from './services/signal.service';

@Module({
  imports: [
    RabbitMQChannel,
    MongooseModule.forFeature([{ name: XRay.name, schema: XRaySchema }]),
  ],
  providers: [SignalService],
})
export class SignalModule {}
