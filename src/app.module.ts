import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SignalModule } from './modules/signal/signal.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:password@localhost:27017/xray_db', {
      authSource: 'admin',
    }),
    SignalModule,
  ],
})
export class AppModule {}
