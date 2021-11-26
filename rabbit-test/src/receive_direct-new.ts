import amqp from "amqplib";
import dotenv from "dotenv";
import { RoutingKeys } from "./events/routing-keys";
import { TicketCreatedConsumer } from "./events/ticket-created-consumer";

dotenv.config();

amqp
  .connect(
    `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@localhost`
  )
  .then(async function (conn) {
    process.once("SIGINT", function () {
      conn.close();
    });

    return conn.createChannel().then(async function (ch) {
      new TicketCreatedConsumer(ch).consume(RoutingKeys.Tickets);
    });
  })
  .catch(console.warn);
