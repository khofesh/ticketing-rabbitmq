import mongoose from "mongoose";
import { app } from "./app";
import { OrderCanceledConsumer } from "./events/consumers/order-canceled-consumer";
import { OrderCreatedConsumer } from "./events/consumers/order-created-consumer";
import { rabbitWrapper } from "./rabbit-wrapper";
import { RoutingKeys } from "@slipperyslope/common";

const start = async () => {
  console.log("tickets 1");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

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
    new OrderCanceledConsumer(ch).consume(RoutingKeys.Orders);
    new OrderCreatedConsumer(ch).consume(RoutingKeys.Orders);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!");
  });
};

start();
