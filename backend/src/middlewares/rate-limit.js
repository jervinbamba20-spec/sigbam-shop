'use strict';

/**
 * Simple in-memory rate limiter (per visitor IP).
 *
 * Used on the checkout route and on product create/update/delete so one
 * visitor cannot spam the API. Behind Render's proxy, ctx.ip is the visitor's
 * real IP because IS_PROXIED=true and PROXY_MAX_IPS_COUNT limits how many
 * X-Forwarded-For entries are trusted (see src/index.js).
 *
 * Route config example:
 *   middlewares: [{ name: 'global::rate-limit', config: { max: 10, windowMs: 60000 } }]
 */
const hits = new Map(); // key -> array of request timestamps

module.exports = (config = {}) => {
  const max = config.max ?? 10;
  const windowMs = config.windowMs ?? 60 * 1000;
  const name = config.name ?? 'default';

  return async (ctx, next) => {
    const now = Date.now();
    const key = `${name}:${ctx.ip}`;
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
      ctx.set('Retry-After', String(retryAfter));
      ctx.status = 429;
      ctx.body = {
        data: null,
        error: {
          status: 429,
          name: 'TooManyRequestsError',
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          details: {},
        },
      };
      return;
    }

    recent.push(now);
    hits.set(key, recent);

    // Occasionally forget old entries so memory stays small
    if (hits.size > 5000) {
      for (const [k, times] of hits) {
        if (!times.some((t) => now - t < windowMs)) hits.delete(k);
      }
    }

    await next();
  };
};
