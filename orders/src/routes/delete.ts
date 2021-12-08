import express, { Request, Response } from "express";
import { Order } from "../models/order";
import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  RoutingKeys,
} from "@slipperyslope/common";
import { rabbitWrapper } from "../rabbit-wrapper";
import { OrderCanceledProducer } from "../events/producers/order-canceled-producer";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Canceled;
    await order.save();

    const ch = await rabbitWrapper.connection.createChannel();
    await new OrderCanceledProducer(ch).produce(
      {
        id: order.id,
        ticket: {
          id: order.ticket.id,
        },
      },
      RoutingKeys.Orders
    );

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
