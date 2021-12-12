import {
  Producer,
  Exchanges,
  PaymentCreatedEvent,
} from "@slipperyslope/common";

export class PaymentCreatedProducer extends Producer<PaymentCreatedEvent> {
  exchange: Exchanges.PaymentCreated = Exchanges.PaymentCreated;
}
