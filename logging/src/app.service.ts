import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { Exchanges, RoutingKeys } from '@slipperyslope/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @RabbitSubscribe({
    exchange: Exchanges.LoggingInfo,
    routingKey: RoutingKeys.Logging,
    queue: '',
    queueOptions: {
      durable: true,
    },
  })
  getLoggingInfo(msg: {}) {
    console.log(`Received info: ${JSON.stringify(msg)}`);
  }

  @RabbitSubscribe({
    exchange: Exchanges.LoggingDebug,
    routingKey: RoutingKeys.Logging,
    queue: '',
    queueOptions: {
      durable: true,
    },
  })
  getLoggingDebug(msg: {}) {
    console.log(`Received debug: ${JSON.stringify(msg)}`);
  }

  @RabbitSubscribe({
    exchange: Exchanges.LoggingError,
    routingKey: RoutingKeys.Logging,
    queue: '',
    queueOptions: {
      durable: true,
    },
  })
  getLoggingError(msg: {}) {
    console.log(`Received error: ${JSON.stringify(msg)}`);
  }

  @RabbitSubscribe({
    exchange: Exchanges.LoggingWarn,
    routingKey: RoutingKeys.Logging,
    queue: '',
    queueOptions: {
      durable: true,
    },
  })
  getLoggingWarn(msg: {}) {
    console.log(`Received warn: ${JSON.stringify(msg)}`);
  }
}
