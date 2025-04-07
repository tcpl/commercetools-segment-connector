import dotenv from 'dotenv';
dotenv.config();

import { createAdminApiRoot } from '../client/create.client';
import { deleteSubscription } from './actions';
import { getLogger } from '../utils/logger.utils';

async function preUndeploy(): Promise<void> {
  const apiRoot = createAdminApiRoot();
  await deleteSubscription(apiRoot);
}

export async function run(): Promise<void> {
  const logger = getLogger(false);
  try {
    logger.info('Running pre-undeploy...');
    await preUndeploy();
    logger.info('Successfully completed pre-undeploy...');
  } catch (error) {
    logger.error('Pre-undeploy failed:', error);
    process.exitCode = 1;
  }
}

run();
