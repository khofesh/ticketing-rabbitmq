import { Module } from '@nestjs/common';
import { Exchanges } from '@slipperyslope/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MongooseModule } from '@nestjs/mongoose';
import { InfoSchema } from './schemas/info.schema';
import { DebugSchema } from './schemas/debug.schema';
import { WarnSchema } from './schemas/warn.schema';
import { ErrorSchema } from './schemas/error.schema';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          type: 'direct',
          name: Exchanges.LoggingInfo,
          options: {
            durable: true,
          },
        },
        {
          type: 'direct',
          name: Exchanges.LoggingDebug,
          options: {
            durable: true,
          },
        },
        {
          type: 'direct',
          name: Exchanges.LoggingError,
          options: {
            durable: true,
          },
        },
        {
          type: 'direct',
          name: Exchanges.LoggingWarn,
          options: {
            durable: true,
          },
        },
      ],

      uri: `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_URL}`,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_INFO, {
      connectionName: 'mongo-info',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_ERROR, {
      connectionName: 'mongo-error',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_WARN, {
      connectionName: 'mongo-warn',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_DEBUG, {
      connectionName: 'mongo-debug',
    }),
    MongooseModule.forFeature(
      [{ name: 'info', schema: InfoSchema }],
      'mongo-info',
    ),
    MongooseModule.forFeature(
      [{ name: 'debug', schema: DebugSchema }],
      'mongo-debug',
    ),
    MongooseModule.forFeature(
      [{ name: 'warn', schema: WarnSchema }],
      'mongo-warn',
    ),
    MongooseModule.forFeature(
      [{ name: 'error', schema: ErrorSchema }],
      'mongo-error',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
