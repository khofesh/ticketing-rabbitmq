import amqp from "amqplib";
import { Consumer, Exchanges, OrderCreatedEvent } from "@slipperyslope/common";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedConsumer extends Consumer<OrderCreatedEvent> {
  exchange: Exchanges.OrderCreated = Exchanges.OrderCreated;

  async handleMessage(msg: amqp.ConsumeMessage | null) {
    try {
      const content = msg?.content.toString();
      let data: OrderCreatedEvent["data"];

      if (content) {
        data = JSON.parse(content);
        console.log("OrderCreatedConsumer data received", data);

        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(
          "Waiting this many milliseconds to process the job:",
          delay
        );

        await expirationQueue.add(
          {
            orderId: data.id,
          },
          {
            delay,
          }
        );
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
