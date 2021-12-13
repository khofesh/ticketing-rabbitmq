import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WarnDocument = Warn & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  optimisticConcurrency: true,
})
export class Warn {
  @Prop({ type: String })
  serviceName: string;

  @Prop()
  className: string;

  @Prop()
  functionName: string;

  @Prop()
  warn: string;
}

export const WarnSchema = SchemaFactory.createForClass(Warn);
