import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'x_rays',
})
export class XRay {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  time: number;

  @Prop({ default: 0 })
  dataLength: number;

  @Prop()
  dataVolume: Array<[number, [number, number, number]]>;
}

export type XRayDocument = mongoose.HydratedDocument<XRay>;

export const XRaySchema = SchemaFactory.createForClass(XRay);

XRaySchema.index({ deviceId: 1, time: 1 }, { unique: true, sparse: true });
