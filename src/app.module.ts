import { Module } from '@nestjs/common';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    RabbitMQModule.register({
      url: 'amqp://admin:password@localhost:5672',
      queue: 'x_ray',
    }),
    MongooseModule.forRoot('mongodb://localhost/x_ray'),
  ],
})
export class AppModule {}
