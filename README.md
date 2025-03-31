# commercetools-segment-connector

This connector uses commercetools subscriptions to send customer and order data to Twilio Segment.

At present this connector handles the following commercetools events:

- `customer`: `ResourceCreated` and `ResourceUpdated`
- `order`: `ResourceCreated`

## Customer Creation/Updates

An `identify` call will be made to Segment when a customer is created or updated in commercetools. This follows the [Segment spec](https://segment.com/docs/connections/spec/identify/).

## Order Creation

The Order Completed event is sent to segment when an order is created in commercetools. It follows the [Segment spec](https://segment.com/docs/connections/spec/ecommerce/v2/#order-completed). Below are details on the value properties.

- `total` - gross total of the order (includes shipping and taxes).
- `subtotal` - net total (without tax) of the order without shipping.
- `discount` - gross total discount amount of the order.
- `shipping` - gross total shipping cost of the order.
- `tax` - total amount of tax applied to the order.

Depending on the destination you are sending the events to, you may need to edit the mapping configuration in Segment. Review these values carefully to ensure they are correct for your use case.

### Anonymous Orders

For anonymous/guest account orders, an Identify event will be sent to segment if there is no registered account for the email address on the order. This is only done if the email address is not already registered in commercetools because otherwise guest account orders (where the email hasn't been verified) would be attached to a registered account.

Note. Segment only accepts events with either an anonymous ID or a user ID, so it is important to ensure anonymous orders have an anonymous ID set. Otherwise these orders won't be able to be sent to Segment.

## Compatibility with other Segment Tracking

If you are using Segment, you are likely to be implementing tracking on your website/apps to track browsing and other events.

In this case, we would recommend using the same anonymous ID on the cart as other tracking code. This will ensure the tracking works as expected between this connector and the other tracking.

In the case of [Segment Analytics.js Source](https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/) you can either pass your anonymous ID to Segment or let Segment generate the anonymous ID and use that.

Implementing this tracking will allow anonymous orders to be associated with a registered account if the customer subsequently signs in or registers in the same browser. See [Best Practices for Identifying Users](https://segment.com/docs/connections/spec/best-practices-identify/) for more details.
