import dotenv from 'dotenv';
dotenv.config();

import { getLogger } from '../utils/logger.utils';

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
