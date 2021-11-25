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

    const queue = "task_queue";

    const ch = await conn.createChannel();
    let ok = ch.assertQueue(queue, { durable: true });

    const something = ok.then(function (_qok) {
      return ch.consume(
        queue,
        function (msg) {
          let secs;
          if (msg?.content) {
            secs = msg?.content.toString().split(".").length - 1;
          } else {
            secs = 1;
          }

          console.log(" [x] Received '%s'", msg?.content.toString());

          setTimeout(function () {
            console.log(" [x] Done");
          }, secs * 1000);
        },
        { noAck: false }
      );
    });

    await something;
    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  })
  .catch(console.warn);
