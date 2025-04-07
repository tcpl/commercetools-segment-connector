import dotenv from 'dotenv';
dotenv.config();

import { getLogger } from '../utils/logger.utils';

export async function run(): Promise<void> {
  const logger = getLogger(false);

  try {
    logger.info('Service - Running post-deploy...');
    logger.info('Service - Successfully completed post-deploy...');
  } catch (error) {
    logger.error('Service - Post-deploy failed:', error);
    process.exitCode = 1;
  }
}

run();
