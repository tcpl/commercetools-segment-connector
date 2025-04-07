import { Analytics, IdentifyParams } from '@segment/analytics-node';
import { getLogger } from '../utils/logger.utils';
import { Customer, Order } from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import {
  buildOrderCompletedTrackEvent,
  buildSegmentContext,
} from './segment-event-builder';
import { Configuration } from '../types/index.types';
import { promisify } from 'util';

const createAnalytics = (configuration: Configuration) => {
  return new Analytics({
    writeKey: configuration.segmentSourceWriteKey,
    host: configuration.segmentAnalyticsHost,
    flushAt: 1, // disable batching
  });
};

export async function identifyCustomer(customer: Customer) {
  const configuration = readConfiguration();
  const logger = getLogger();
  const analytics = createAnalytics(configuration);
  const identifyAsync = promisify(analytics.identify.bind(analytics));

  try {
    // https://segment.com/docs/connections/spec/identify/#custom-traits

    const identifyParams: IdentifyParams = {
      userId: customer.id,
      messageId: `${customer.id}-${customer.version}`,
      timestamp: customer.lastModifiedAt,
      traits: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        title: customer.title,
        dateOfBirth: customer.dateOfBirth,
        customerNumber: customer.customerNumber,
        externalId: customer.externalId,
        isEmailVerified: customer.isEmailVerified,
        locale: customer.locale,
        createdAt: customer.createdAt,
      },
      context: buildSegmentContext(
        customer.custom?.fields?.[configuration.consentCustomFieldName]
      ),
    };

    await identifyAsync(identifyParams);
    logger.info(`Customer ${customer.id} sent to Segment successfully`);
  } catch (error) {
    logger.error(`Error sending customer ${customer.id} to Segment: ${error}`);
    throw error;
  }
}

export async function identifyAnonymousCustomer(
  anonymousId: string,
  email: string,
  consentJson?: string
) {
  const configuration = readConfiguration();
  const logger = getLogger();
  const analytics = createAnalytics(configuration);
  const identifyAsync = promisify(analytics.identify.bind(analytics));

  try {
    const identifyParams = {
      anonymousId,
      traits: { email },
      context: buildSegmentContext(consentJson),
    };

    await identifyAsync(identifyParams);
    logger.info(
      `Anonymous customer ${anonymousId} sent to Segment successfully`
    );
  } catch (error) {
    logger.error(
      `Error sending anonymous customer ${anonymousId} to Segment: ${error}`
    );
    throw error;
  }
}

export async function trackOrderCompleted(order: Order) {
  const configuration = readConfiguration();
  const logger = getLogger();
  const analytics = createAnalytics(configuration);
  const trackAsync = promisify(analytics.track.bind(analytics));

  try {
    const event = buildOrderCompletedTrackEvent(order);

    await trackAsync(event);
    logger.info(
      `Order Completed ${order.id} track event sent to Segment successfully`
    );
  } catch (error) {
    logger.error(`Error sending order to Segment: ${error}`);
    throw error;
  }
}
