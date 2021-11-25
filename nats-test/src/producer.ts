import { connect, StringCodec } from "nats";

const server = "http://localhost:4222";

const doSomething = async (v: string) => {
  try {
    const nc = await connect({ servers: v });
    console.log(`connected to ${nc.getServer()}`);

    // this promise indicates the client closed
    const done = nc.closed();

    // create a codec
    const sc = StringCodec();

    const data = JSON.stringify({
      id: "123",
      title: "concerte",
      price: 20,
    });

    nc.publish("ticket:created", sc.encode("hello"));
    nc.publish("ticket:created", sc.encode("world"));
    nc.publish("ticket:created", sc.encode(data));

    // we want to insure that messages that are in flight
    // get processed, so we are going to drain the
    // connection. Drain is the same as close, but makes
    // sure that all messages in flight get seen
    // by the iterator. After calling drain on the connection
    // the connection closes.
    await nc.drain();

    // check if the close was OK
    const err = await done;
    if (err) {
      console.log(`error closing:`, err);
    }
  } catch (error) {
    console.log(`error connecting to ${JSON.stringify(v)}`);
    console.error(error);
  }
};

doSomething(server);
