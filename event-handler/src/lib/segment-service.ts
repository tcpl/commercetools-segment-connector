import { Analytics, TrackParams } from '@segment/analytics-node';
import { getLogger } from '../utils/logger.utils';
import {
  Customer,
  LineItem,
  Order,
  ShippingInfo,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import Decimal from 'decimal.js';

const createAnalytics = () => {
  const configuration = readConfiguration();

  return new Analytics({
    writeKey: configuration.segmentSourceWriteKey,
  });
};

export function identifyCustomer(customer: Customer) {
  const logger = getLogger();

  const analytics = createAnalytics();

  try {
    // https://segment.com/docs/connections/spec/identify/#custom-traits

    analytics.identify({
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
    });

    logger.info(`Customer ${customer.id} sent to Segment successfully`);
  } catch (error) {
    logger.error(`Error sending customer ${customer.id} to Segment: ${error}`);
    throw error;
  }
}

export async function identifyAnonymousCustomer(
  anonymousId: string,
  email: string
) {
  const logger = getLogger();

  const analytics = createAnalytics();

  try {
    analytics.identify({
      anonymousId,
      traits: { email },
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
  const logger = getLogger();

  const analytics = createAnalytics();

  try {
    // https://segment.com/docs/connections/spec/ecommerce/v2/#order-completed

    const event: TrackParams = buildOrderCompletedTrackEvent(order);

    analytics.track(event);

    logger.info(
      `Order Completed ${order.id} track event sent to Segment successfully`
    );
  } catch (error) {
    logger.error(`Error sending order to Segment: ${error}`);
    throw error;
  }
}

const buildOrderCompletedTrackEvent = (order: Order) => {
  const products = order.lineItems.map((lineItem, i) => {
    const imageUrl =
      lineItem.variant.images && lineItem.variant.images.length > 0
        ? lineItem.variant.images[0]?.url
        : undefined;

    return {
      product_id: lineItem.productId,
      sku: lineItem.variant.sku,
      price: getTypedMoneyInCurrencyUnits(getLineItemPrice(lineItem)),
      quantity: lineItem.quantity,
      image_url: imageUrl,
      position: i + 1,
    };
  });

  // TODO: handle no taxed values
  const subTotalCentAmount =
    order.taxedPrice!.totalNet.centAmount -
    order.taxedShippingPrice!.totalNet.centAmount;

  const shippingCentAmount = order.taxedShippingPrice!.totalGross.centAmount;

  const subTotalCurrencyUnits = getCentAmountInCurrencyUnits(
    subTotalCentAmount,
    order.totalPrice.fractionDigits
  );

  let discountTotalCents = order.lineItems.reduce((acc, lineItem) => {
    return (
      acc +
      lineItem.discountedPricePerQuantity.reduce(
        (discountAcc, discountedPricePerQuantity) => {
          return (
            discountAcc +
            discountedPricePerQuantity.discountedPrice.includedDiscounts.reduce(
              (discountedPriceAcc, discount) => {
                return (
                  discountedPricePerQuantity.quantity *
                    discount.discountedAmount.centAmount +
                  discountedPriceAcc
                );
              },
              0
            )
          );
        },
        0
      )
    );
  }, 0);

  discountTotalCents +=
    order.discountOnTotalPrice?.discountedAmount?.centAmount ?? 0;

  discountTotalCents += getShippingDiscountInCents(order);

  const event: TrackParams = {
    userId: order.customerId as string, // need either userId or anonymousId
    anonymousId: order.anonymousId,
    timestamp: order.createdAt,
    messageId: `${order.id}-order-completed`,
    event: 'Order Completed',
    properties: {
      email: order.customerEmail,
      order_id: order.id,
      total: getTypedMoneyInCurrencyUnits(order.taxedPrice!.totalGross), // Subtotal ($) with shipping and taxes added in
      subtotal: subTotalCurrencyUnits, // subtotal: Order total after discounts but before taxes and shipping
      // gross discount amount
      discount: getCentAmountInCurrencyUnits(
        discountTotalCents,
        order.totalPrice.fractionDigits
      ),
      // gross shipping amount
      shipping: getCentAmountInCurrencyUnits(
        shippingCentAmount,
        order.totalPrice.fractionDigits
      ),
      tax:
        order.taxedPrice?.totalTax !== undefined
          ? getTypedMoneyInCurrencyUnits(order.taxedPrice.totalTax)
          : undefined,
      // coupon is a defined as a string in Spec: V2 Ecommerce Events, so just using the first discount code
      coupon:
        order.discountCodes && order.discountCodes.length > 0
          ? order.discountCodes[0].discountCode
          : undefined,
      products,
      currency: order.totalPrice?.currencyCode,
    },
  };
  return event;
};

const getShippingDiscountInCents = (order: Order) => {
  if (order.shippingMode === 'Multiple') {
    const shippingDiscountCentAmount = order.shipping.reduce(
      (acc, shipping) => {
        return acc + getShippingInfoDiscountInCents(shipping.shippingInfo);
      },
      0
    );

    return shippingDiscountCentAmount;
  }

  if (!order.shippingInfo) {
    return 0;
  }

  return getShippingInfoDiscountInCents(order.shippingInfo);
};

const getLineItemPrice = (lineItem: LineItem) => {
  return lineItem.price.discounted
    ? lineItem.price.discounted.value
    : lineItem.price.value;
};

const getShippingInfoDiscountInCents = (shippingInfo: ShippingInfo) => {
  const discountedCentAmount = shippingInfo.discountedPrice?.value?.centAmount;

  if (!discountedCentAmount) {
    return 0;
  }

  return shippingInfo.price.centAmount - discountedCentAmount;
};

const getTypedMoneyInCurrencyUnits = (money: TypedMoney) => {
  return getCentAmountInCurrencyUnits(money.centAmount, money.fractionDigits);
};

const getCentAmountInCurrencyUnits = (
  centAmount: number,
  fractionDigits: number
) => {
  return new Decimal(centAmount)
    .div(new Decimal(10).pow(fractionDigits))
    .toNumber();
};
