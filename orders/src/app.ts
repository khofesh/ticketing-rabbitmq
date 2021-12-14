import express from "express";
import "express-async-errors";
import MongoStore from "connect-mongo";
import session from "express-session";

import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@slipperyslope/common";
import { deleteOrderRouter } from "./routes/delete";
import { newOrderRouter } from "./routes/new";
import { indexOrderRouter } from "./routes";
import { showOrderRouter } from "./routes/show";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  session({
    name: "ticketing_session",
    secret: process.env.JWT_KEY!,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI_SESSION,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      // secure: true,
      // expires: expiryDate,
      // maxAge: 60000 * 2, // 2 minutes
    },
  })
);
app.use(currentUser);

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
