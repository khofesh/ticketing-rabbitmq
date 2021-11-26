import { Producer } from "./base-producer";
import { Exchanges } from "./exchanges";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedProducer extends Producer<TicketCreatedEvent> {
  exchange: Exchanges.TicketCreated = Exchanges.TicketCreated;
}
