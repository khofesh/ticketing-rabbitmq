import mongoose from "mongoose";
import { app } from "./app";
import { TicketCreatedConsumer } from "./events/consumers/ticket-created-consumer";
import { TicketUpdatedConsumer } from "./events/consumers/ticket-updated-consumer";
import { rabbitWrapper } from "./rabbit-wrapper";
import { RoutingKeys } from "@slipperyslope/common";
import { ExpirationCompleteConsumer } from "./events/consumers/expiration-complete-consumer";

const start = async () => {
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
    new TicketCreatedConsumer(ch).consume(RoutingKeys.Tickets);
    new TicketUpdatedConsumer(ch).consume(RoutingKeys.Tickets);
    new ExpirationCompleteConsumer(ch).consume(RoutingKeys.Expiration);

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
