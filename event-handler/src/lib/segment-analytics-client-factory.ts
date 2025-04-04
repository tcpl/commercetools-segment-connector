import Analytics from '@segment/analytics-node';
import { readConfiguration } from '../utils/config.utils';

let analytics: Analytics | undefined = undefined;

export const getAnalytics = () => {
  // don't want to cache the instance when running tests
  if (process.env.NODE_ENV !== 'test' && analytics) {
    return analytics;
  }

  const configuration = readConfiguration();

  analytics = new Analytics({
    writeKey: configuration.segmentSourceWriteKey,
    host: configuration.segmentAnalyticsHost,
  });

  return analytics;
};
