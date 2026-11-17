module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    // Allow the admin panel to show images hosted on Cloudinary
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    // CORS_ORIGINS="https://my-shop.vercel.app,http://localhost:3000"
    // When not set, every origin is allowed (handy for local development).
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', ['*']),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
