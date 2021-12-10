import { RoutingKeys } from "@slipperyslope/common";
import { OrderCreatedConsumer } from "./events/consumers/order-created-consumer";
import { rabbitWrapper } from "./rabbit-wrapper";

const start = async () => {
  try {
    await rabbitWrapper.connect(
      `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_URL}`
    );

    process.once("SIGINT", function () {
      rabbitWrapper.connection.close();
    });

    process.once("SIGTERM", function () {
      rabbitWrapper.connection.close();
    });

    // listener
    const ch = await rabbitWrapper.connection.createChannel();
    new OrderCreatedConsumer(ch).consume(RoutingKeys.Orders);
  } catch (err) {
    console.error(err);
  }
};

start();
