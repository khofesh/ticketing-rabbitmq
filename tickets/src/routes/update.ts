import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  RoutingKeys,
} from "@slipperyslope/common";
import { Ticket } from "../models/ticket";
import { TicketUpdatedProducer } from "../events/producers/ticket-update-producer";
import { rabbitWrapper } from "../rabbit-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be provided and must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    // create a channel and produce data
    const ch = await rabbitWrapper.connection.createChannel();
    await new TicketUpdatedProducer(ch).produce(
      {
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
      },
      RoutingKeys.Tickets
    );

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
