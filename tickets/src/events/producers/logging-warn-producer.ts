import { Producer, Exchanges, LoggingWarnEvent } from "@slipperyslope/common";

export class LoggingWarnProducer extends Producer<LoggingWarnEvent> {
  exchange: Exchanges.LoggingWarn = Exchanges.LoggingWarn;
}
