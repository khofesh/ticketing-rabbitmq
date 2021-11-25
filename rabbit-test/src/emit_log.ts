import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

amqp
  .connect(
    `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@localhost`
  )
  .then(async function (conn) {
    return conn
      .createChannel()
      .then(async function (ch) {
        var exchange = "logs";
        var ok = ch.assertExchange(exchange, "fanout", { durable: true });

        var message = process.argv.slice(2).join(" ") || "info: Hello World!";

        await ok;
        ch.publish(exchange, "", Buffer.from(message));
        console.log(" [x] Sent '%s'", message);
        return await ch.close();
      })
      .finally(function () {
        conn.close();
      });
  })
  .catch(console.warn);
