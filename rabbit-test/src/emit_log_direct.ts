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
        const exchange = "direct_logs";
        const ok = ch.assertExchange(exchange, "direct", { durable: true });

        const args = process.argv.slice(2);
        const message = args.slice(1).join(" ") || "Hello World!";
        const severity = args.length > 0 ? args[0] : "info";

        await ok;
        ch.publish(exchange, severity, Buffer.from(message));
        console.log(" [x] Sent %s: '%s'", severity, message);
        return await ch.close();
      })
      .finally(function () {
        conn.close();
      });
  })
  .catch(console.warn);
