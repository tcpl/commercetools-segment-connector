import dotenv from 'dotenv';
dotenv.config();

import { createApiRoot } from '../client/create.client';
import { deleteSubscription } from './actions';
import { getLogger } from '../utils/logger.utils';

async function preUndeploy(): Promise<void> {
  const apiRoot = createApiRoot();
  await deleteSubscription(apiRoot);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function run(): Promise<void> {
  const logger = getLogger(false);
  try {
    logger.info('Running pre-undeploy...');
    await delay(2000);
    // await preUndeploy();
    logger.info('Successfully completed pre-undeploy...');
  } catch (error) {
    logger.error('Pre-undeploy failed:', error);
    process.exitCode = 1;
  }
}

run();
