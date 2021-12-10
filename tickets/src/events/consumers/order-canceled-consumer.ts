import amqp from "amqplib";
import {
  Consumer,
  Exchanges,
  OrderCanceledEvent,
  RoutingKeys,
} from "@slipperyslope/common";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedProducer } from "../producers/ticket-updated-producer";

export class OrderCanceledConsumer extends Consumer<OrderCanceledEvent> {
  exchange: Exchanges.OrderCanceled = Exchanges.OrderCanceled;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: OrderCanceledEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("OrderCanceledConsumer data received", data);

        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
          throw new Error("Ticket not found");
        }

        ticket.set({ orderId: undefined });
        await ticket.save();

        // produce 'ticket updated'
        await new TicketUpdatedProducer(this.channel).produce(
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
      console.log("OrderCanceledConsumer error", error);
    }
  }
}
