import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DebugDocument = Debug & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  optimisticConcurrency: true,
})
export class Debug {
  @Prop()
  serviceName: string;

  @Prop()
  className: string;

  @Prop()
  functionName: string;

  @Prop()
  debung: string;
}

export const DebugSchema = SchemaFactory.createForClass(Debug);
