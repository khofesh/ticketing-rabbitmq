import { Producer, Exchanges, OrderCreatedEvent } from "@slipperyslope/common";

export class OrderCreatedProducer extends Producer<OrderCreatedEvent> {
  exchange: Exchanges.OrderCreated = Exchanges.OrderCreated;
}
