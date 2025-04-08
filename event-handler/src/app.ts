import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {
  handleCustomerUpsert,
  handleCustomerDeletion,
} from './lib/customer-event-handler';
import { handleOrderCreated } from './lib/order-event-handler';
import { validateMessageBody } from './validators/message.validators';
import ServiceError from './errors/service.error';
import { getLogger } from './utils/logger.utils';

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

app.post('/', async (req: Request, res: Response) => {
  const logger = getLogger();

  try {
    const messageBody = await validateMessageBody(req);
    const resourceType = messageBody.resource.typeId;

    const notificationType = messageBody.notificationType;

    const resourceId = messageBody.resource.id;

    if (resourceType === 'customer') {
      switch (notificationType) {
        case 'ResourceCreated':
        case 'ResourceUpdated':
          await handleCustomerUpsert(resourceId);
          break;
        case 'ResourceDeleted':
          await handleCustomerDeletion(resourceId);
          break;
      }
    } else if (
      resourceType === 'order' &&
      notificationType === 'ResourceCreated'
    ) {
      await handleOrderCreated(resourceId);
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    } else {
      logger.error('Error processing message', error);
      res.status(500).send();
    }
  }
});

export default app;
