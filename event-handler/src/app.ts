import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { decodeToJson } from './utils/decoder.utils';
import { handleCustomerCreated as handleCustomerUpsert } from './lib/customer-event-handler';
import { handleOrderCreated } from './lib/order-event-handler';

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

app.post('/', async (req: Request, res: Response) => {
  const encodedMessageBody = req.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);
  const resourceType = messageBody.resource.typeId;

  const notificationType = messageBody.notificationType;

  const resourceId = messageBody.resource.id;

  if (resourceType === 'customer') {
    switch (notificationType) {
      case 'ResourceCreated':
      case 'ResourceUpdated':
        await handleCustomerUpsert(resourceId);
        break;
    }
  } else if (resourceType === 'order') {
    switch (notificationType) {
      case 'ResourceCreated':
        await handleOrderCreated(resourceId);
        break;
    }
  }

  res.status(204).send();
});

export default app;
