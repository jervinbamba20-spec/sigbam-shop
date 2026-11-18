'use strict';

/**
 * Custom order route used by the storefront:
 *   POST /api/orders/checkout
 *
 * `auth: false` makes it public (customers don't need to log in). The default
 * CRUD routes for orders are NOT exposed, so order data stays private and can
 * only be viewed by admins in the Strapi admin panel.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/checkout',
      handler: 'order.checkout',
      config: {
        auth: false,
        policies: [],
        // Max 10 checkout attempts per visitor per minute
        middlewares: [{ name: 'global::rate-limit', config: { name: 'checkout', max: 10, windowMs: 60 * 1000 } }],
      },
    },
  ],
};
