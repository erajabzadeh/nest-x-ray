import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { SignalModule } from './modules/signal/signal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get(
          'MONGODB_URL',
          'mongodb://admin:password@localhost:27017',
        ),
        authSource: 'admin',
      }),
      inject: [ConfigService],
    }),
    SignalModule,
  ],
})
export class AppModule {}
