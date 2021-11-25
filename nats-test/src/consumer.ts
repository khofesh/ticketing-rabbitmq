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

    const ch = await conn.createChannel();
    let ok = ch.assertQueue("hello", { durable: false });

    const something = ok.then(function (_qok) {
      return ch.consume(
        "hello",
        function (msg) {
          console.log(" [x] Received '%s'", msg?.content.toString());
        },
        { noAck: true }
      );
    });

    await something;
    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  })
  .catch(console.warn);
