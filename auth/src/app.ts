import express from "express";
import "express-async-errors";
import MongoStore from "connect-mongo";
import session from "express-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler, NotFoundError } from "@slipperyslope/common";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  session({
    name: "ticketing_session",
    secret: "hello",
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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
