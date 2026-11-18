import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// The Strapi API URL is read at BUILD time to create the security headers below.
// If NUXT_PUBLIC_STRAPI_URL changes on Vercel, redeploy the frontend.
const apiUrl = (process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '')

// Content-Security-Policy: only allow our own files, the Strapi API,
// Cloudinary images and Google Fonts.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // Nuxt injects a small inline config script
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${apiUrl} https://res.cloudinary.com`,
  `connect-src 'self' ${apiUrl}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Security headers for the deployed site (production builds only)
  $production: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': contentSecurityPolicy,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
    },
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  // Port 3000 is often used by other projects, so the store runs on 3001
  devServer: { port: 3001 },

  // The cart and wishlist are kept in the browser (localStorage), so the app is
  // rendered on the client only (SPA mode). This avoids SSR hydration mismatches.
  ssr: false,

  app: {
    head: {
      title: 'ShopKart | E-Commerce Store',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ShopKart e-commerce store powered by Nuxt 4, Vuetify 4 and Strapi 5.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // Inter font from Google Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },

  css: ['@mdi/font/css/materialdesignicons.css', '~/assets/main.css'],

  build: { transpile: ['vuetify'] },

  // Override with an environment variable, e.g.
  // NUXT_PUBLIC_STRAPI_URL=https://my-strapi.onrender.com
  runtimeConfig: {
    public: {
      strapiUrl: 'http://localhost:1337',
    },
  },

  modules: [
    // Registers the Vuetify Vite plugin so components are auto-imported (tree-shaken)
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error: plugins is typed as readonly but is safe to extend here
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],

  vite: {
    vue: { template: { transformAssetUrls } },
  },
})
