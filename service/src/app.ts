import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

app.post('/', async (_: Request, res: Response) => {
  res.status(204).send();
});

export default app;
