import amqp from "amqplib";
import { Consumer, Exchanges, TicketCreatedEvent } from "@slipperyslope/common";
import { Ticket } from "../../models/ticket";

export class TicketCreatedConsumer extends Consumer<TicketCreatedEvent> {
  exchange: Exchanges.TicketCreated = Exchanges.TicketCreated;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    const content = msg?.content.toString();
    let data: TicketCreatedEvent["data"];

    if (content) {
      data = JSON.parse(content);
      console.log("TicketCreatedConsumer data received", data);

      const { title, price, id } = data;
      const ticket = Ticket.build({
        id,
        title,
        price,
      });
      await ticket.save();
    }

    console.log(
      " [x] %s: '%s'",
      msg?.fields.routingKey,
      msg?.content.toString()
    );
  }
}
