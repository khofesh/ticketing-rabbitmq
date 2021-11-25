import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

function fib(n: number) {
  // Do it the ridiculous, but not most ridiculous, way. For better,
  // see http://nayuki.eigenstate.org/page/fast-fibonacci-algorithms
  var a = 0,
    b = 1;
  for (var i = 0; i < n; i++) {
    var c = a + b;
    a = b;
    b = c;
  }
  return a;
}

amqp
  .connect(
    `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@localhost`
  )
  .then(async function (conn) {
    return conn.createChannel().then(async function (ch) {
      const queue = "rpc_queue";

      const ok = ch.assertQueue(queue, { durable: false });

      ch.prefetch(1);
      await ch.consume(queue, reply);

      await ok;
      console.log(" [x] Awaiting RPC requests");

      function reply(msg: amqp.ConsumeMessage | null) {
        if (msg) {
          const n = parseInt(msg?.content.toString());

          console.log(" [.] fib(%d)", n);
          const response = fib(n);

          ch.sendToQueue(
            msg?.properties.replyTo,
            Buffer.from(response.toString()),
            { correlationId: msg?.properties.correlationId }
          );

          ch.ack(msg);
        } else {
          return;
        }
      }
    });
  })
  .catch(console.warn);
