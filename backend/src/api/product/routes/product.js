'use strict';

/**
 * product router: GET/POST /api/products, GET/PUT/DELETE /api/products/:id
 */
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::product.product');
