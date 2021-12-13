import { Producer, Exchanges, LoggingErrorEvent } from "@slipperyslope/common";

export class LoggingErrorProducer extends Producer<LoggingErrorEvent> {
  exchange: Exchanges.LoggingError = Exchanges.LoggingError;
}
