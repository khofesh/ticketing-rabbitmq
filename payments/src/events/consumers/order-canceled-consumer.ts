import amqp from "amqplib";
import {
  Consumer,
  Exchanges,
  OrderCanceledEvent,
  OrderStatus,
} from "@slipperyslope/common";
import { Order } from "../../models/order";

export class OrderCanceledConsumer extends Consumer<OrderCanceledEvent> {
  exchange: Exchanges.OrderCanceled = Exchanges.OrderCanceled;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: OrderCanceledEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("payments OrderCreatedConsumer data received", data);

        const order = await Order.findOne({
          _id: data.id,
        });

        if (!order) {
          throw new Error("Order not found");
        }

        order.set({
          status: OrderStatus.Canceled,
        });
        await order.save();
      }
      console.log(
        " [x] %s: '%s'",
        msg?.fields.routingKey,
        msg?.content.toString()
      );
    } catch (error) {
      console.log("payments OrderCanceledConsumer error", error);
    }
  }
}
