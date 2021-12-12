import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  OrderStatus,
  RoutingKeys,
} from "@slipperyslope/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedProducer } from "../events/producers/payment-created-producer";
import { rabbitWrapper } from "../rabbit-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { token, orderId } = req.body;

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).send({ message: "Not found" });
      }

      if (order.userId !== req.currentUser!.id) {
        return res.status(401).send({ message: "Not authorized" });
      }

      if (order.status === OrderStatus.Canceled) {
        return res.status(400).send({ message: "canceled order" });
      }

      const charge = await stripe.charges.create({
        currency: "usd",
        amount: order.price * 100, // convert to 'cent'
        source: token,
      });

      const payment = Payment.build({
        orderId,
        stripeId: charge.id,
      });
      await payment.save();

      // create a channel and produce data
      const ch = await rabbitWrapper.connection.createChannel();
      new PaymentCreatedProducer(ch).produce(
        {
          id: payment.id,
          orderId: payment.orderId,
          stripeId: payment.stripeId,
        },
        RoutingKeys.Payments
      );

      res.status(201).send({ success: true, id: payment.id });
    } catch (error) {
      res.status(500).send({ success: false, message: "Error in the server" });
    }
  }
);

export { router as createChargeRouter };
