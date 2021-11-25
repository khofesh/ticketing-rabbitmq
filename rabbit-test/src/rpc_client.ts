import amqp from "amqplib";
import dotenv from "dotenv";
import { basename } from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

let n: number;
try {
  if (process.argv.length < 3) throw Error("Too few args");
  n = parseInt(process.argv[2]);
} catch (e) {
  console.error(e);
  console.warn("Usage: %s number", basename(process.argv[1]));
  process.exit(1);
}

amqp
  .connect(
    `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@localhost`
  )
  .then(async function (conn) {
    return conn
      .createChannel()
      .then(function (ch) {
        return new Promise(function (resolve) {
          const corrId = uuidv4();

          function maybeAnswer(msg: amqp.ConsumeMessage | null) {
            if (msg?.properties.correlationId === corrId) {
              resolve(msg.content.toString());
            }
          }

          const ok = ch
            .assertQueue("", { exclusive: true })
            .then(function (qok) {
              return qok.queue;
            });

          const ok2 = ok.then(function (queue) {
            return ch
              .consume(queue, maybeAnswer, { noAck: true })
              .then(function () {
                return queue;
              });
          });

          const ok3 = ok2.then(function (queue) {
            console.log(" [x] Requesting fib(%d)", n);
            ch.sendToQueue("rpc_queue", Buffer.from(n.toString()), {
              correlationId: corrId,
              replyTo: queue,
            });
          });
        });
      })
      .then(function (fibN) {
        console.log(" [.] Got %d", fibN);
      })
      .finally(function () {
        conn.close();
      });
  })
  .catch(console.warn);
