import { Exchanges } from "./exchanges";
import { RoutingKeys } from "./routing-keys";

export interface TicketCreatedEvent {
  exchange: Exchanges.TicketCreated;
  routingKey: RoutingKeys.Tickets;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
