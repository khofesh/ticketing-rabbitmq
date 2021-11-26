import { Exchanges } from "./exchanges";

export interface TicketCreatedEvent {
  exchange: Exchanges.TicketCreated;
  routingKey: "ticket";
  data: {
    id: string;
    title: string;
    price: number;
  };
}
