import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

amqp
  .connect(
    `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@localhost`
  )
  .then(function (conn) {
    return conn
      .createChannel()
      .then(async function (ch) {
        var queue = "task_queue";
        var msg = process.argv.slice(2).join(" ") || "Hello World!";

        var ok = ch.assertQueue(queue, { durable: true });

        await ok;

        // NB: `sentToQueue` and `publish` both return a boolean
        // indicating whether it's OK to send again straight away, or
        // (when `false`) that you should wait for the event `'drain'`
        // to fire before writing again. We're just doing the one write,
        // so we'll ignore it.
        ch.sendToQueue(queue, Buffer.from(msg), { persistent: true });
        console.log(" [x] Sent '%s'", msg);
        return await ch.close();
      })
      .finally(function () {
        conn.close();
      });
  })
  .catch(console.warn);
