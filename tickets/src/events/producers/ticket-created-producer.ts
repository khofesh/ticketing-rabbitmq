import { Producer, Exchanges, TicketCreatedEvent } from "@slipperyslope/common";

export class TicketCreatedProducer extends Producer<TicketCreatedEvent> {
  exchange: Exchanges.TicketCreated = Exchanges.TicketCreated;
}
