import { RoutingKeys } from "@slipperyslope/common";
import Queue from "bull";
import { ExpirationCompleteProducer } from "../events/producers/expiration-complete-producer";
import { rabbitWrapper } from "../rabbit-wrapper";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiraton", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  const ch = await rabbitWrapper.connection.createChannel();
  await new ExpirationCompleteProducer(ch).produce(
    {
      orderId: job.data.orderId,
    },
    RoutingKeys.Expiration
  );

  console.log(
    "I want to publish an expiration:complete event for orderId",
    job.data.orderId
  );
});

export { expirationQueue };
