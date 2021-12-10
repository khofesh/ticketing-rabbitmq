import amqp from "amqplib";
import {
  Consumer,
  Exchanges,
  OrderCreatedEvent,
  RoutingKeys,
} from "@slipperyslope/common";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedProducer } from "../producers/ticket-updated-producer";
import { rabbitWrapper } from "../../rabbit-wrapper";

export class OrderCreatedConsumer extends Consumer<OrderCreatedEvent> {
  exchange: Exchanges.OrderCreated = Exchanges.OrderCreated;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: OrderCreatedEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("OrderCreatedConsumer data received", data);

        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket, throw error
        if (!ticket) {
          throw new Error("Ticket not found");
        }

        // mark the ticket as being reserved by setting its orderId property
        ticket.set({ orderId: data.id });

        // save the ticket
        await ticket.save();
        // produce 'ticket updated'
        // listener
        const ch = await rabbitWrapper.connection.createChannel();
        new TicketUpdatedProducer(ch).produce(
          {
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
          },
          RoutingKeys.Tickets
        );

        return;
      }

      console.log(
        " [x] %s: '%s'",
        msg?.fields.routingKey,
        msg?.content.toString()
      );
    } catch (error) {
      console.log("OrderCreatedConsumer error", error);
    }
  }
}
