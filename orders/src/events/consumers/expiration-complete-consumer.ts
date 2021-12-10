import amqp from "amqplib";
import {
  Consumer,
  Exchanges,
  ExpirationCompleteEvent,
  OrderStatus,
  RoutingKeys,
} from "@slipperyslope/common";
import { Order } from "../../models/order";
import { OrderCanceledProducer } from "../producers/order-canceled-producer";
import { rabbitWrapper } from "../../rabbit-wrapper";

export class ExpirationCompleteConsumer extends Consumer<ExpirationCompleteEvent> {
  exchange: Exchanges.ExpirationComplete = Exchanges.ExpirationComplete;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: ExpirationCompleteEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("TicketCreatedConsumer data received", data);

        const order = await Order.findById(data.orderId).populate("ticket");

        if (!order) {
          throw new Error("order not found");
        }

        order.set({
          status: OrderStatus.Canceled,
        });
        await order.save();

        // produce 'order canceled'
        const ch = await rabbitWrapper.connection.createChannel();
        await new OrderCanceledProducer(ch).produce(
          {
            id: order.id,
            ticket: {
              id: order.ticket.id,
            },
          },
          RoutingKeys.Orders
        );
      }

      console.log(
        " [x] %s: '%s'",
        msg?.fields.routingKey,
        msg?.content.toString()
      );
    } catch (error) {
      console.log("ExpirationCompleteConsumer error", error);
    }
  }
}
