import amqp from "amqplib";
import { Exchanges } from "./exchanges";

interface Event {
  exchange: Exchanges;
  routingKey: string;
  data: any;
}

export abstract class Consumer<T extends Event> {
  abstract exchange: T["exchange"];
  private channel: amqp.Channel;

  constructor(channel: amqp.Channel) {
    this.channel = channel;
  }

  async consume(key: T["routingKey"]): Promise<void> {
    await this.channel.assertExchange(this.exchange, "direct", {
      durable: true,
    });

    const ok = await this.channel.assertQueue("", { exclusive: true });

    await this.channel.bindQueue(ok.queue, this.exchange, key);

    await this.channel.consume(ok.queue, logMessage, { noAck: true });

    console.log(" [*] Waiting for logs. To exit press CTRL+C");

    function logMessage(msg: amqp.ConsumeMessage | null) {
      console.log(
        " [x] %s: '%s'",
        msg?.fields.routingKey,
        msg?.content.toString()
      );
    }
  }
}
