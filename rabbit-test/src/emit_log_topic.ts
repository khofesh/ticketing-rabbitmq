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
        const exchange = "topic_logs";

        const args = process.argv.slice(2);
        const message = args.slice(1).join(" ") || "Hello World!";
        const key = args.length > 0 ? args[0] : "anonymous.info";

        const ok = ch.assertExchange(exchange, "topic", { durable: true });

        await ok;
        ch.publish(exchange, key, Buffer.from(message));
        console.log(" [x] Sent %s: '%s'", key, message);
        return await ch.close();
      })
      .finally(function () {
        conn.close();
      });
  })
  .catch(console.warn);
