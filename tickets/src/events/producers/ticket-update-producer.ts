import { Producer, Exchanges, TicketUpdatedEvent } from "@slipperyslope/common";

export class TicketUpdatedProducer extends Producer<TicketUpdatedEvent> {
  exchange: Exchanges.TicketUpdated = Exchanges.TicketUpdated;
}
