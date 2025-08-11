import { NestFactory } from '@nestjs/core';
import { ProducerModule } from './producer.module';
import { ProducerService } from './services/producer.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ProducerModule);
  await app.get(ProducerService).generate(2);
  await app.close();
}

bootstrap()
  .then(() => process.exit())
  .catch((err) => console.error(err));
