import amqp from "amqplib";
import {
  Consumer,
  Exchanges,
  OrderStatus,
  PaymentCreatedEvent,
} from "@slipperyslope/common";
import { Order } from "../../models/order";

export class PaymentCreatedConsumer extends Consumer<PaymentCreatedEvent> {
  exchange: Exchanges.PaymentCreated = Exchanges.PaymentCreated;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: PaymentCreatedEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("PaymentCreatedConsumer data received", data);

        const order = await Order.findById(data.orderId);

        if (!order) {
          throw new Error("order not found");
        }

        order.set({
          status: OrderStatus.Complete,
        });
        await order.save();
      }
    } catch (error) {
      console.log("PaymentCreatedConsumer error", error);
    }
  }
}
