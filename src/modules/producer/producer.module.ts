import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { ProducerService } from './services/producer.service';

@Module({
  imports: [
    RabbitMQModule.register({
      url: 'amqp://admin:password@localhost:5672',
      queue: 'x_ray',
    }),
  ],
  providers: [ProducerService],
})
export class ProducerModule {}
