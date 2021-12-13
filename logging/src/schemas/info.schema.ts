import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InfoDocument = Info & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  optimisticConcurrency: true,
})
export class Info {
  @Prop()
  serviceName: string;

  @Prop()
  className: string;

  @Prop()
  functionName: string;

  @Prop()
  info: string;
}

export const InfoSchema = SchemaFactory.createForClass(Info);
