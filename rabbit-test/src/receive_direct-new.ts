import amqp from "amqplib";
import dotenv from "dotenv";
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
      new TicketCreatedConsumer(ch).consume("ticket");
    });
  })
  .catch(console.warn);
