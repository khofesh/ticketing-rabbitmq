import amqp from "amqplib";
import { Consumer, Exchanges, OrderCreatedEvent } from "@slipperyslope/common";
import { Order } from "../../models/order";

export class OrderCreatedConsumer extends Consumer<OrderCreatedEvent> {
  exchange: Exchanges.OrderCreated = Exchanges.OrderCreated;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: OrderCreatedEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("payments OrderCreatedConsumer data received", data);

        const order = Order.build({
          id: data.id,
          price: data.ticket.price,
          status: data.status,
          userId: data.userId,
        });

        await order.save();
      }
      console.log(
        " [x] %s: '%s'",
        msg?.fields.routingKey,
        msg?.content.toString()
      );
    } catch (error) {
      console.log("payments OrderCreatedConsumer error", error);
    }
  }
}
