import amqp from "amqplib";
import { Consumer } from "./base-consumer";
import { Exchanges } from "./exchanges";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedConsumer extends Consumer<TicketCreatedEvent> {
  readonly exchange = Exchanges.TicketCreated;

  logMessage(msg: amqp.ConsumeMessage | null) {
    console.log(
      " [x] %s: '%s'",
      msg?.fields.routingKey,
      msg?.content.toString()
    );
  }
}
