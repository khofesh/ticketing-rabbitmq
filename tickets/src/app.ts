import express from "express";
import "express-async-errors";
import MongoStore from "connect-mongo";
import session from "express-session";

import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@slipperyslope/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes/index";
import { updateTicketRouter } from "./routes/update";

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
