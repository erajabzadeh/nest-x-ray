import { Module } from '@nestjs/common';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule.register({
      url: 'amqp://admin:password@localhost:5672',
      queue: 'x_ray',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
