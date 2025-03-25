import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { getLogger } from './utils/logger.utils';
import { decodeToJson } from './utils/decoder.utils';

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

app.post('/', async (req: Request, res: Response) => {
  const logger = getLogger();

  const encodedMessageBody = req.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);
  const resourceType = messageBody?.resource?.typeId;

  const notificationType = messageBody.notificationType;

  logger.info('Event message received!');
  logger.info(`Resource type: ${resourceType}`);
  logger.info(`Notification type: ${notificationType}`);

  logger.info('Message body:');
  logger.info(JSON.stringify(messageBody));

  res.status(204).send();
});

export default app;
