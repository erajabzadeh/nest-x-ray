import { ConfigurableModuleBuilder } from '@nestjs/common';
import { RabbitMQModuleOptions } from './interfaces/rabbitmq-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<RabbitMQModuleOptions>().build();
