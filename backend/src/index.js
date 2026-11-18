'use strict';

const fs = require('fs');
const path = require('path');
const seedProducts = require('./seed-data');

/**
 * Public (not logged-in) API permissions needed by the Nuxt frontend.
 * The checkout route sets `auth: false` itself, so it is not listed here.
 */
const PUBLIC_PERMISSIONS = [
  'api::product.product.find',
  'api::product.product.findOne',
  'api::product.product.create',
  'api::product.product.update',
  'api::product.product.delete',
  'plugin::upload.content-api.upload',
];

async function grantPublicPermissions(strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  for (const action of PUBLIC_PERMISSIONS) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });
    if (!existing) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: publicRole.id } });
      strapi.log.info(`[bootstrap] Granted public permission: ${action}`);
    }
  }
}

async function uploadSeedImage(strapi, fileName) {
  const filePath = path.join(__dirname, '..', 'data', 'images', fileName);
  if (!fs.existsSync(filePath)) return null;
  const stats = fs.statSync(filePath);
  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      data: { fileInfo: { alternativeText: fileName.replace('.png', ''), name: fileName } },
      files: {
        filepath: filePath,
        originalFilename: fileName,
        mimetype: 'image/png',
        size: stats.size,
      },
    });
  return file;
}

async function seedProductsIfEmpty(strapi) {
  if (process.env.SEED_DATA === 'false') return;
  const count = await strapi.documents('api::product.product').count();
  if (count > 0) return;

  strapi.log.info('[bootstrap] No products found, seeding sample products...');
  for (const { image, ...product } of seedProducts) {
    let file = null;
    try {
      file = await uploadSeedImage(strapi, image);
    } catch (err) {
      strapi.log.warn(`[bootstrap] Could not upload ${image}: ${err.message}`);
    }
    await strapi.documents('api::product.product').create({
      data: { ...product, isActive: true, image: file ? file.id : null },
    });
  }
  strapi.log.info(`[bootstrap] Seeded ${seedProducts.length} products.`);
}

module.exports = {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }) {
    // Behind Render's proxy only trust the last N X-Forwarded-For entries,
    // so a visitor can't fake their IP to dodge the rate limiter.
    const maxIps = parseInt(process.env.PROXY_MAX_IPS_COUNT || '0', 10);
    if (maxIps > 0) strapi.server.app.maxIpsCount = maxIps;

    await grantPublicPermissions(strapi);
    await seedProductsIfEmpty(strapi);
  },
};
