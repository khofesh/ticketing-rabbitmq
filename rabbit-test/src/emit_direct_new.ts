import amqp from "amqplib";
import dotenv from "dotenv";
import { RoutingKeys } from "./events/routing-keys";
import { TicketCreatedProducer } from "./events/ticket-created-producer";
dotenv.config();

amqp
  .connect(
    `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@localhost`
  )
  .then(async function (conn) {
    return conn
      .createChannel()
      .then(async function (ch) {
        const producer = new TicketCreatedProducer(ch);

        await producer.produce(
          {
            id: "123",
            title: "concert",
            price: 20,
          },
          RoutingKeys.Tickets
        );
      })
      .finally(function () {
        conn.close();
      });
  })
  .catch(console.warn);
