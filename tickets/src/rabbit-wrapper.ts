import * as amqp from "amqplib";

class RabbitWrapper {
  private _conn?: amqp.Connection;

  get connection() {
    if (!this._conn) {
      throw new Error("Cannot access  rabbitmq connection before connecting");
    }

    return this._conn;
  }

  async connect(url: string) {
    try {
      this._conn = await amqp.connect(url);
    } catch (error) {
      console.warn(error);
    }
  }
}

export const rabbitWrapper = new RabbitWrapper();
