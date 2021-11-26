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
      const { title, price } = req.body;

      const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id,
      });
      await ticket.save();

      // create a channel and produce data
      const ch = await rabbitWrapper.connection.createChannel();
      await new TicketCreatedProducer(ch).produce(
        {
          id: ticket.id,
          title: ticket.title,
          price: ticket.price,
          userId: ticket.userId,
        },
        RoutingKeys.Tickets
      );

      // await ch.close();

      res.status(201).send(ticket);
    } catch (error) {
      console.error(error);
    }
  }
);

export { router as createTicketRouter };
