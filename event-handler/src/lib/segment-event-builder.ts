import {
  LineItem,
  Order,
  ShippingInfo,
  TypedMoney,
} from '@commercetools/platform-sdk';
import Decimal from 'decimal.js';
import { TrackParams } from '@segment/analytics-node';
import _ from 'lodash';
import { readConfiguration } from '../utils/config.utils';

export const buildOrderCompletedTrackEvent = (order: Order): TrackParams => {
  if (!order.taxedPrice) {
    throw new Error(`Order ${order.id} is missing taxedPrice`);
  }

  if (!order.taxedShippingPrice) {
    throw new Error(`Order ${order.id} is missing taxedShippingPrice`);
  }

  const subTotalCents =
    order.taxedPrice.totalNet.centAmount -
    order.taxedShippingPrice.totalNet.centAmount;

  const shippingTotalCents = order.taxedShippingPrice.totalGross.centAmount;

  const discountTotalCents = calculateDiscountTotalCents(order);

  // https://segment.com/docs/connections/spec/ecommerce/v2/#order-completed

  return {
    userId: order.customerId as string, // need either userId or anonymousId
    anonymousId: order.anonymousId,
    timestamp: order.createdAt,
    messageId: `${order.id}-order-completed`,
    event: 'Order Completed',
    properties: {
      email: order.customerEmail,
      order_id: order.id,
      total: getTypedMoneyInCurrencyUnits(order.taxedPrice.totalGross),
      subtotal: getCentAmountInCurrencyUnits(
        subTotalCents,
        order.totalPrice.fractionDigits
      ),
      discount: getCentAmountInCurrencyUnits(
        discountTotalCents,
        order.totalPrice.fractionDigits
      ),
      shipping: getCentAmountInCurrencyUnits(
        shippingTotalCents,
        order.totalPrice.fractionDigits
      ),
      tax:
        order.taxedPrice.totalTax !== undefined
          ? getTypedMoneyInCurrencyUnits(order.taxedPrice.totalTax)
          : undefined,
      coupon: getCouponCode(order),
      products: buildProducts(order),
      currency: order.totalPrice.currencyCode,
    },
  };
};

const calculateDiscountTotalCents = (order: Order): number => {
  let discountTotalCents = _.sumBy(order.lineItems, (lineItem) =>
    _.sumBy(
      lineItem.discountedPricePerQuantity,
      (discountedPricePerQuantity) =>
        discountedPricePerQuantity.quantity *
        _.sumBy(
          discountedPricePerQuantity.discountedPrice.includedDiscounts,
          (discount) => discount.discountedAmount.centAmount
        )
    )
  );

  discountTotalCents +=
    order.discountOnTotalPrice?.discountedAmount?.centAmount ?? 0;

  discountTotalCents += getShippingDiscountInCents(order);

  return discountTotalCents;
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

const getShippingInfoDiscountInCents = (shippingInfo: ShippingInfo) => {
  const discountedCentAmount = shippingInfo.discountedPrice?.value?.centAmount;

  if (!discountedCentAmount) {
    return 0;
  }

  return shippingInfo.price.centAmount - discountedCentAmount;
};

const getLineItemPrice = (lineItem: LineItem) => {
  return lineItem.price.discounted
    ? lineItem.price.discounted.value
    : lineItem.price.value;
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

const buildProducts = (order: Order) => {
  const { locale } = readConfiguration();

  return order.lineItems.map((lineItem, i) => {
    const imageUrl =
      lineItem.variant.images && lineItem.variant.images.length > 0
        ? lineItem.variant.images[0]?.url
        : undefined;

    return {
      product_id: lineItem.productId,
      name: lineItem.name[locale],
      sku: lineItem.variant.sku,
      price: getTypedMoneyInCurrencyUnits(getLineItemPrice(lineItem)),
      quantity: lineItem.quantity,
      image_url: imageUrl,
      position: i + 1,
    };
  });
};
const getCouponCode = (order: Order) => {
  if (!order.discountCodes || order.discountCodes.length === 0) {
    return undefined;
  }

  // Export only supports one discount code
  const discountCode = order.discountCodes[0].discountCode;

  return discountCode.obj?.code;
};
