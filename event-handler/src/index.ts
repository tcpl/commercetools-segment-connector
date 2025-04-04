import app from './app';
import { getAnalytics } from './lib/segment-analytics-client-factory';
import { getLogger } from './utils/logger.utils';

const PORT = 8080;

const server = app.listen(PORT, () => {
  const logger = getLogger();
  logger.info(`⚡️ Service listening on port ${PORT}`);
});

const onExit = async () => {
  await getAnalytics().flush({ close: true });

  server.close(() => {
    process.exit();
  });
};

['SIGINT', 'SIGTERM'].forEach((code) => process.on(code, onExit));
