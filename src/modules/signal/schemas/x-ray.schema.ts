import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'x_rays',
})
export class XRay {
  @Prop({ type: mongoose.Schema.Types.String, required: true })
  deviceId: string;

  @Prop({ type: mongoose.Schema.Types.Number, required: true })
  time: number;

  @Prop({ type: mongoose.Schema.Types.Number, default: 0 })
  dataLength: number;

  @Prop({ type: mongoose.Schema.Types.Array })
  dataVolume: Array<[number, [number, number, number]]>;
}

export type XRayDocument = mongoose.HydratedDocument<XRay>;
export type PersistedXRay = XRay & {
  _id: mongoose.Types.ObjectId;
  __v: number;
};

export const XRaySchema = SchemaFactory.createForClass(XRay);

XRaySchema.index({ deviceId: 1, time: 1 }, { unique: true, sparse: true });
