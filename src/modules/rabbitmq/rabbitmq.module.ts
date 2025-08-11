import { Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './rabbitmq.module-definition';
import { RabbitMQService } from './services/rabbitmq.service';

@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule extends ConfigurableModuleClass {}
