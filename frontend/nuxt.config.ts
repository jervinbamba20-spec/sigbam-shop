import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  // Port 3000 is often used by other projects, so the store runs on 3001
  devServer: { port: 3001 },

  // The cart and wishlist are kept in the browser (localStorage), so the app is
  // rendered on the client only (SPA mode). This avoids SSR hydration mismatches.
  ssr: false,

  app: {
    head: {
      title: 'SigBam Shop | E-Commerce Store',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'SigBam Shop e-commerce store powered by Nuxt 4, Vuetify 4 and Strapi 5.' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
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
