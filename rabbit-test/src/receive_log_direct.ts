import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
  process.exit(1);
}

amqp
  .connect(
    `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@localhost`
  )
  .then(async function (conn) {
    process.once("SIGINT", function () {
      conn.close();
    });

    return conn.createChannel().then(async function (ch) {
      const exchange = "direct_logs";
      await ch.assertExchange(exchange, "direct", { durable: true });

      const ok = await ch.assertQueue("", { exclusive: true });

      await ch.bindQueue(ok.queue, exchange, "");

      args.forEach(function (severity) {
        ch.bindQueue(ok.queue, exchange, severity);
      });

      await ch.consume(ok.queue, logMessage, { noAck: true });

      console.log(" [*] Waiting for logs. To exit press CTRL+C");

      function logMessage(msg: amqp.ConsumeMessage | null) {
        console.log(
          " [x] %s: '%s'",
          msg?.fields.routingKey,
          msg?.content.toString()
        );
      }
    });
  })
  .catch(console.warn);
