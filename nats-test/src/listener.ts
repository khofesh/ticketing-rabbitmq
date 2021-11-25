import { connect, StringCodec, NatsConnection } from "nats";

const server = "http://localhost:4222";

let nc: NatsConnection;
const doSomething = async (v: string) => {
  try {
    nc = await connect({ servers: v });
    console.log(`connected to ${nc.getServer()}`);

    // do something with the connection

    // create a codec
    const sc = StringCodec();
    // create a simple subscriber and iterate over messages
    // matching the subscription
    const sub = nc.subscribe("ticket:created");
    for await (const m of sub) {
      console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    }
  } catch (error) {
    console.log(`error connecting to ${JSON.stringify(v)}`);
    console.error(error);
  }
};

doSomething(server);

process.on("SIGINT", async () => {
  await nc.close();

  return console.log("subscription closed");
});
process.on("SIGTERM", async () => {
  await nc.close();
  return console.log("subscription closed");
});
