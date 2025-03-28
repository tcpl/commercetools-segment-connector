import {
  LineItem,
  Order,
  ShippingInfo,
  TypedMoney,
} from '@commercetools/platform-sdk';
import Decimal from 'decimal.js';
import { TrackParams } from '@segment/analytics-node';

export const buildOrderCompletedTrackEvent = (order: Order): TrackParams => {
  if (!order.taxedPrice) {
    throw new Error(`Order ${order.id} is missing taxedPrice`);
  }

  if (!order.taxedShippingPrice) {
    throw new Error(`Order ${order.id} is missing taxedShippingPrice`);
  }

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

  const subTotalCentAmount =
    order.taxedPrice.totalNet.centAmount -
    order.taxedShippingPrice.totalNet.centAmount;

  const shippingCentAmount = order.taxedShippingPrice.totalGross.centAmount;

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
      total: getTypedMoneyInCurrencyUnits(order.taxedPrice.totalGross), // Subtotal ($) with shipping and taxes added in
      subtotal: subTotalCurrencyUnits, // subtotal: Order total after discounts but before taxes and shipping
      discount: getCentAmountInCurrencyUnits(
        discountTotalCents,
        order.totalPrice.fractionDigits
      ),
      shipping: getCentAmountInCurrencyUnits(
        shippingCentAmount,
        order.totalPrice.fractionDigits
      ),
      tax:
        order.taxedPrice.totalTax !== undefined
          ? getTypedMoneyInCurrencyUnits(order.taxedPrice.totalTax)
          : undefined,
      coupon:
        order.discountCodes && order.discountCodes.length > 0
          ? order.discountCodes[0].discountCode
          : undefined,
      products,
      currency: order.totalPrice.currencyCode,
    },
  };
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
