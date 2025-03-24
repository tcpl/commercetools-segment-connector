import express, { Request, Response } from 'express';
import { hello } from 'common';

const app = express();
app.disable('x-powered-by');

app.post('/deltaSync', (req: Request, res: Response) => {
  res.status(204).send();
});

export default app;
