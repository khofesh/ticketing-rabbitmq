import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ErrorDocument = Error & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  optimisticConcurrency: true,
})
export class Error {
  @Prop({ required: true })
  serviceName: string;

  @Prop()
  className: string;

  @Prop()
  functionName: string;

  @Prop({ required: true })
  error: string;
}

export const ErrorSchema = SchemaFactory.createForClass(Error);
