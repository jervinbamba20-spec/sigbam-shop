module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public address of the API (Render sets PUBLIC_URL); used for admin links
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  // Behind Render's proxy: trust X-Forwarded-* headers so ctx.ip is the visitor's IP
  proxy: env.bool('IS_PROXIED', false),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
