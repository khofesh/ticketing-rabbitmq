import { connect, Connection } from "amqplib";

class RabbitWrapper {
  private _conn?: Connection;

  get connection() {
    if (!this._conn) {
      throw new Error("Cannot access  rabbitmq connection before connecting");
    }

    return this._conn;
  }

  async connect(url: string) {
    try {
      this._conn = await connect(url);

      console.log("connected to rabbitmq");
    } catch (error) {
      console.warn(error);
    }
  }
}

export const rabbitWrapper = new RabbitWrapper();
