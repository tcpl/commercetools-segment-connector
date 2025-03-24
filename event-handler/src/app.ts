import express, { Request, Response } from "express";
import { hello } from "common";

const app = express();
app.disable("x-powered-by");

app.get("/", (req: Request, res: Response) => {
  res.send(hello());
});

export default app;
