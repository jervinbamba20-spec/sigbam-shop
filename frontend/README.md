# ShopKart Storefront (Nuxt 4 + Vuetify 4)

Frontend for the ShopKart e-commerce store (Web Systems and Technologies final project).
The Strapi API is in the separate `ecomm-backend` repository.

## Pages

| Route | Page |
|---|---|
| `/` | Homepage: hero, categories, search, category filter, product grid, wishlist, promo, newsletter |
| `/products` | Product Management: create, view, edit, delete, image upload, search, status |
| `/checkout` | Checkout All: order summary, customer form, payment method |

Important files:
- `app/composables/useStrapi.ts`: all API calls (`$fetch`, `populate=image`, image upload, checkout).
- `app/composables/useCart.ts`: cart and wishlist state (saved in localStorage), totals and stock limits.
- `app/pages/checkout.vue`: form validation; the cart is cleared only after a successful checkout.

## Run locally

```bash
npm install
npm run dev    # http://localhost:3001 (expects Strapi at http://localhost:1337)
```

## Deploy (Vercel)

Import this repository in Vercel (preset: Nuxt.js, root `./`) and set
`NUXT_PUBLIC_STRAPI_URL` to the Render API URL (no trailing slash) for Production and Preview.
The security headers (Content-Security-Policy) are built from that URL, so redeploy after changing it.
