import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  req.session.jwt = "";

  res.send({});
});

export { router as signoutRouter };
