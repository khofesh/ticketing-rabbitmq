import amqp from "amqplib";
import { Consumer, Exchanges, TicketUpdatedEvent } from "@slipperyslope/common";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedConsumer extends Consumer<TicketUpdatedEvent> {
  exchange: Exchanges.TicketUpdated = Exchanges.TicketUpdated;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: TicketUpdatedEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("TicketUpdatedConsumer data received", data);

        const ticket = await Ticket.findById(data.id);
        if (!ticket) {
          throw new Error("ticket not found");
        }

        const { title, price } = data;
        ticket.set({ title, price });
        await ticket.save();
      } else {
        console.log(
          " [x] %s: '%s'",
          msg?.fields.routingKey,
          msg?.content.toString()
        );
      }
    } catch (error) {
      console.log("TicketUpdatedConsumer error", error);
    }
  }
}
