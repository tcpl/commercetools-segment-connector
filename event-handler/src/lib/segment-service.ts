import { Analytics, TrackParams } from '@segment/analytics-node';
import { getLogger } from '../utils/logger.utils';
import {
  Customer,
  LineItem,
  Order,
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

    const products = order.lineItems.map((lineItem, i) => {
      return {
        product_id: lineItem.productId,
        sku: lineItem.variant.sku,
        price: getTypedMoneyInCurrencyUnits(getLineItemPrice(lineItem)),
        quantity: lineItem.quantity,
        image_url:
          lineItem.variant.images && lineItem.variant.images.length > 0
            ? lineItem.variant.images[0]?.url
            : undefined,
        position: i + 1,
      };
    });

    let subTotalCentAmount = order.lineItems.reduce((acc, lineItem) => {
      return acc + lineItem.totalPrice.centAmount;
    }, 0);

    subTotalCentAmount -=
      order.discountOnTotalPrice?.discountedAmount?.centAmount ?? 0;

    const subTotalCurrencyUnits = getCentAmountInCurrencyUnits(
      subTotalCentAmount,
      order.totalPrice.fractionDigits
    );

    let discountTotalCents = order.lineItems.reduce((acc, lineItem) => {
      const lineItemPrice = getLineItemPrice(lineItem);
      const lineItemSubtotal = lineItemPrice.centAmount * lineItem.quantity;
      const lineItemTotal = lineItem.totalPrice.centAmount;
      const lineItemDiscount = lineItemSubtotal - lineItemTotal;

      return acc + lineItemDiscount;
    }, 0);

    discountTotalCents +=
      order.discountOnTotalPrice?.discountedAmount?.centAmount ?? 0;

    // TODO: add shipping discount to discount total

    const event: TrackParams = {
      userId: order.customerId as string, // need either userId or anonymousId
      anonymousId: order.anonymousId,
      timestamp: order.createdAt,
      messageId: `${order.id}-order-completed`,
      event: 'Order Completed',
      properties: {
        email: order.customerEmail,
        order_id: order.id,
        total: getTypedMoneyInCurrencyUnits(order.totalPrice), // Subtotal ($) with shipping and taxes added in
        subtotal: subTotalCurrencyUnits, // subtotal: Order total after discounts but before taxes and shipping
        revenue: subTotalCurrencyUnits, // Revenue ($) associated with the transaction (including discounts, but excluding shipping and taxes)
        discount: getCentAmountInCurrencyUnits(
          discountTotalCents,
          order.totalPrice.fractionDigits
        ),
        shipping: getShippingCostInCurrencyUnits(order),
        tax:
          order.taxedPrice?.totalTax !== undefined
            ? getTypedMoneyInCurrencyUnits(order.taxedPrice?.totalTax)
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

    analytics.track(event);

    logger.info(
      `Order Completed ${order.id} track event sent to Segment successfully`
    );
  } catch (error) {
    logger.error(`Error sending order to Segment: ${error}`);
    throw error;
  }
}

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

const getLineItemPrice = (lineItem: LineItem) => {
  return lineItem.price.discounted
    ? lineItem.price.discounted.value
    : lineItem.price.value;
};

const getShippingCostInCurrencyUnits = (order: Order) => {
  // TODO: check for discounts

  if (order.shippingMode === 'Multiple') {
    const shippingTotalCentAmount = order.shipping.reduce((acc, shipping) => {
      return acc + shipping.shippingInfo.price.centAmount;
    }, 0);

    return getCentAmountInCurrencyUnits(
      shippingTotalCentAmount,
      order.totalPrice.fractionDigits
    );
  }

  if (!order.shippingInfo) {
    return 0;
  }

  return getTypedMoneyInCurrencyUnits(order.shippingInfo.price);
};
