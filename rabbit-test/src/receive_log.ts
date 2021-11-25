import amqp from "amqplib";
import dotenv from "dotenv";

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
      const exchange = "logs";
      await ch.assertExchange(exchange, "fanout", { durable: true });

      const ok = await ch.assertQueue("", { exclusive: true });

      await ch.bindQueue(ok.queue, exchange, "");

      await ch.consume(ok.queue, logMessage, { noAck: true });

      console.log(" [*] Waiting for logs. To exit press CTRL+C");

      function logMessage(msg: amqp.ConsumeMessage | null) {
        console.log(" [x] '%s'", msg?.content.toString());
      }
    });
  })
  .catch(console.warn);
