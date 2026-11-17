'use strict';

/**
 * product controller: the default Strapi CRUD actions
 * (find, findOne, create, update, delete).
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product');
