import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError, validateRequest } from "@slipperyslope/common";
import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

declare module "express-session" {
  interface Session {
    jwt: string;
  }
}

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password can't be empty"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Login failed!");
    }

    const passwordsMatched = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatched) {
      throw new BadRequestError("Invalid Credentials!");
    }

    // generate jwt
    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    // store jwt on session object
    req.session.jwt = userJwt;

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
