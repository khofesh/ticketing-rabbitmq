import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Exchanges,
  LoggingDebugEvent,
  LoggingErrorEvent,
  LoggingInfoEvent,
  LoggingWarnEvent,
  RoutingKeys,
} from '@slipperyslope/common';
import { InfoDocument } from './schemas/info.schema';
import { DebugDocument } from './schemas/debug.schema';
import { WarnDocument } from './schemas/warn.schema';
import { ErrorDocument } from './schemas/error.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('info') private infoModel: Model<InfoDocument>,
    @InjectModel('debug') private debugModel: Model<DebugDocument>,
    @InjectModel('warn') private warnModel: Model<WarnDocument>,
    @InjectModel('error') private errorModel: Model<ErrorDocument>,
  ) {}

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
  async getLoggingInfo(msg: LoggingInfoEvent['data']) {
    try {
      console.log(`Received info: ${JSON.stringify(msg)}`);

      const createdInfo = new this.infoModel({
        serviceName: msg.serviceName,
        functionName: msg.functionName,
        className: msg.className,
        info: msg.info,
      });

      await createdInfo.save();
    } catch (error) {
      console.log('getLoggingInfo error', error);
    }
  }

  @RabbitSubscribe({
    exchange: Exchanges.LoggingDebug,
    routingKey: RoutingKeys.Logging,
    queue: '',
    queueOptions: {
      durable: true,
    },
  })
  async getLoggingDebug(msg: LoggingDebugEvent['data']) {
    try {
      console.log(`Received debug: ${JSON.stringify(msg)}`);

      const createdDebug = new this.debugModel({
        serviceName: msg.serviceName,
        functionName: msg.functionName,
        className: msg.className,
        debug: JSON.stringify(msg.debug),
      });

      await createdDebug.save();
    } catch (error) {
      console.log('getLoggingDebug error', error);
    }
  }

  @RabbitSubscribe({
    exchange: Exchanges.LoggingError,
    routingKey: RoutingKeys.Logging,
    queue: '',
    queueOptions: {
      durable: true,
    },
  })
  async getLoggingError(msg: LoggingErrorEvent['data']) {
    try {
      console.log(`Received error: ${JSON.stringify(msg)}`);

      const createdError = new this.errorModel({
        serviceName: msg.serviceName,
        functionName: msg.functionName,
        className: msg.className,
        error: JSON.stringify(msg.error),
      });

      await createdError.save();
    } catch (error) {
      console.log('getLoggingError error', error);
    }
  }

  @RabbitSubscribe({
    exchange: Exchanges.LoggingWarn,
    routingKey: RoutingKeys.Logging,
    queue: '',
    queueOptions: {
      durable: true,
    },
  })
  async getLoggingWarn(msg: LoggingWarnEvent['data']) {
    try {
      console.log(`Received warn: ${JSON.stringify(msg)}`);

      const createdWarn = new this.warnModel({
        serviceName: msg.serviceName,
        functionName: msg.functionName,
        className: msg.className,
        warn: JSON.stringify(msg.warn),
      });

      await createdWarn.save();
    } catch (error) {
      console.log('getLoggingWarn error', error);
    }
  }
}
