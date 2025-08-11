import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './rabbitmq.module-definition';
import { RabbitMQConnection } from './providers/rabbitmq-connection.provider';
import { RabbitMQChannel } from './providers/rabbitmq-channel.provider';

@Module({
  providers: [RabbitMQConnection, RabbitMQChannel],
})
export class RabbitMQModule extends ConfigurableModuleClass {}
