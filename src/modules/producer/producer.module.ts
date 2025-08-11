import { Module } from '@nestjs/common';
import { RabbitMQChannel } from '../rabbitmq/providers/rabbitmq-channel.provider';
import { GenerateXRayDataCommand } from './commands/generate-x-ray-data.command';

@Module({
  imports: [RabbitMQChannel, GenerateXRayDataCommand],
})
export class ProducerModule {}
