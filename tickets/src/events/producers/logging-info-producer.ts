import { Producer, Exchanges, LoggingInfoEvent } from "@slipperyslope/common";

export class LoggingInfoProducer extends Producer<LoggingInfoEvent> {
  exchange: Exchanges.LoggingInfo = Exchanges.LoggingInfo;
}
