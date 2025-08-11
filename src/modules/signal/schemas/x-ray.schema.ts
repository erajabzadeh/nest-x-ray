import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class XRay {
  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true })
  time: number;

  @Prop({ default: 0 })
  dataLength: number;

  @Prop()
  dataVolume: Array<
    [
      number,
      [
        mongoose.Schema.Types.Decimal128,
        mongoose.Schema.Types.Decimal128,
        mongoose.Schema.Types.Decimal128,
      ],
    ]
  >;
}

export type XRayDocument = mongoose.HydratedDocument<XRay>;
export const XRaySchema = SchemaFactory.createForClass(XRay);
