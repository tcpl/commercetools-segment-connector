import Analytics from '@segment/analytics-node';
import { readConfiguration } from '../utils/config.utils';

let analytics: Analytics | undefined = undefined;

export const getAnalytics = () => {
  if (analytics) {
    return analytics;
  }
  const configuration = readConfiguration();

  analytics = new Analytics({
    writeKey: configuration.segmentSourceWriteKey,
    host: configuration.segmentAnalyticsHost,
  });

  return analytics;
};
