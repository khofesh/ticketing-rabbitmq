import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  RoutingKeys,
  validateRequest,
} from "@slipperyslope/common";
import { Ticket } from "../models/ticket";
import { TicketCreatedProducer } from "../events/producers/ticket-created-producer";
import { rabbitWrapper } from "../rabbit-wrapper";
import { LoggingInfoProducer } from "../events/producers/logging-info-producer";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      // create a channel
      const ch = await rabbitWrapper.connection.createChannel();

      // log info
      await new LoggingInfoProducer(ch).produce(
        {
          serviceName: "tickets",
          className: "none",
          functionName: "none",
          info: "[Begin] route /api/tickets POST, create new ticket",
        },
        RoutingKeys.Logging
      );

      const { title, price } = req.body;

      const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id,
      });
      await ticket.save();

      // create a channel
      const ch2 = await rabbitWrapper.connection.createChannel();
      // produce data
      await new TicketCreatedProducer(ch2).produce(
        {
          id: ticket.id,
          title: ticket.title,
          price: ticket.price,
          userId: ticket.userId,
        },
        RoutingKeys.Tickets
      );

      // await ch.close();

      // create a channel
      const ch3 = await rabbitWrapper.connection.createChannel();
      // log info
      await new LoggingInfoProducer(ch3).produce(
        {
          serviceName: "tickets",
          className: "none",
          functionName: "none",
          info: "[End] route /api/tickets POST, create new ticket",
        },
        RoutingKeys.Logging
      );

      res.status(201).send(ticket);
    } catch (error) {
      console.error(error);
    }
  }
);

export { router as createTicketRouter };
