'use strict';

/**
 * product router: GET/POST /api/products, GET/PUT/DELETE /api/products/:id
 *
 * Product Management has no login, so create/update/delete are rate limited
 * (30 changes per visitor per minute) to slow down abuse.
 */
const { createCoreRouter } = require('@strapi/strapi').factories;

const writeLimit = [{ name: 'global::rate-limit', config: { name: 'product-write', max: 30, windowMs: 60 * 1000 } }];

module.exports = createCoreRouter('api::product.product', {
  config: {
    create: { middlewares: writeLimit },
    update: { middlewares: writeLimit },
    delete: { middlewares: writeLimit },
  },
});
