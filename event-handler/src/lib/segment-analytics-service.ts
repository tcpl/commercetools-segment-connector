import { Analytics, IdentifyParams } from '@segment/analytics-node';
import { getLogger } from '../utils/logger.utils';
import { Customer, Order } from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import {
  buildOrderCompletedTrackEvent,
  buildSegmentContext,
} from './segment-event-builder';
import { Configuration } from '../types/index.types';

const createAnalytics = (configuration: Configuration) => {
  return new Analytics({
    writeKey: configuration.segmentSourceWriteKey,
  });
};

export function identifyCustomer(customer: Customer) {
  const configuration = readConfiguration();
  const logger = getLogger();
  const analytics = createAnalytics(configuration);

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

    analytics.identify(identifyParams);
    logger.info(`Customer ${customer.id} sent to Segment successfully`);
  } catch (error) {
    logger.error(`Error sending customer ${customer.id} to Segment: ${error}`);
    throw error;
  }
}

export function identifyAnonymousCustomer(
  anonymousId: string,
  email: string,
  consentJson?: string
) {
  const configuration = readConfiguration();
  const logger = getLogger();
  const analytics = createAnalytics(configuration);

  try {
    analytics.identify({
      anonymousId,
      traits: { email },
      context: buildSegmentContext(consentJson),
    });

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

export function trackOrderCompleted(order: Order) {
  const configuration = readConfiguration();
  const logger = getLogger();

  const analytics = createAnalytics(configuration);

  try {
    const event = buildOrderCompletedTrackEvent(order);

    analytics.track(event);

    logger.info(
      `Order Completed ${order.id} track event sent to Segment successfully`
    );
  } catch (error) {
    logger.error(`Error sending order to Segment: ${error}`);
    throw error;
  }
}
