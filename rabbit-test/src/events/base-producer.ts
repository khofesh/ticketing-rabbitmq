import amqp from "amqplib";
import { Exchanges } from "./exchanges";

interface Event {
  exchange: Exchanges;
  routingKey: string;
  data: any;
}

export abstract class Producer<T extends Event> {
  abstract exchange: T["exchange"];
  private channel: amqp.Channel;

  constructor(channel: amqp.Channel) {
    this.channel = channel;
  }

  async produce(data: T["data"], key: T["routingKey"]): Promise<void> {
    const ok = this.channel.assertExchange(this.exchange, "direct", {
      durable: true,
    });

    await ok;
    this.channel.publish(this.exchange, key, Buffer.from(JSON.stringify(data)));

    console.log(" [x] Sent %s: '%s'", key, JSON.stringify(data));
    return await this.channel.close();
  }
}
