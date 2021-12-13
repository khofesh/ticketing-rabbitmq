import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Exchanges } from '@slipperyslope/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
