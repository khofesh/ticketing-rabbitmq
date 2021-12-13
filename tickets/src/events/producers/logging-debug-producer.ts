import { Producer, Exchanges, LoggingDebugEvent } from "@slipperyslope/common";

export class LoggingDebugProducer extends Producer<LoggingDebugEvent> {
  exchange: Exchanges.LoggingDebug = Exchanges.LoggingDebug;
}
