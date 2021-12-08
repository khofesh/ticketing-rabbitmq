import { Producer, Exchanges, OrderCanceledEvent } from "@slipperyslope/common";

export class OrderCanceledProducer extends Producer<OrderCanceledEvent> {
  exchange: Exchanges.OrderCanceled = Exchanges.OrderCanceled;
}
