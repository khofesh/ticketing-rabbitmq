import {
  Producer,
  Exchanges,
  ExpirationCompleteEvent,
} from "@slipperyslope/common";

export class ExpirationCompleteProducer extends Producer<ExpirationCompleteEvent> {
  exchange: Exchanges.ExpirationComplete = Exchanges.ExpirationComplete;
}
