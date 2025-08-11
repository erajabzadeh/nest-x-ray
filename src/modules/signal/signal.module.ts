import { Module } from '@nestjs/common';
import { RabbitMQChannel } from '../rabbitmq/providers/rabbitmq-channel.provider';

@Module({
  imports: [RabbitMQChannel],
})
export class SignalModule {}
