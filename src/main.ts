import { NestFactory } from '@nestjs/core';
import { NestiaSwaggerComposer } from '@nestia/sdk';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const docs = await NestiaSwaggerComposer.document(app, {
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'localhost',
      },
    ],
  });
  SwaggerModule.setup('docs', app, docs as any);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
