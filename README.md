# ShopKart: E-Commerce Web Application

Final Examination project for **Web Systems and Technologies**.
Built with **Nuxt 4 + Vue 3 (Composition API)**, **Vuetify 4**, **Strapi 5** and **PostgreSQL**.

```
sigbam/
├── backend/      Strapi 5 (REST API + admin panel), PostgreSQL
├── frontend/     Nuxt 4 + Vuetify 4 storefront and Product Management
├── screenshots/  Homepage, Product Management, Cart and Checkout screenshots
└── render.yaml   One-click deployment of Strapi + PostgreSQL on Render
```

## Features

| Module | Where |
|---|---|
| Product Management CRUD (create, view, edit, delete, image upload, search, status) | `/products`, [frontend/app/pages/products.vue](frontend/app/pages/products.vue) |
| Homepage: App Bar, Hero, Categories, Products, Promo, Newsletter, Footer | `/`, [frontend/app/pages/index.vue](frontend/app/pages/index.vue) |
| Search (name / description / category) + Category filter + All Categories | [index.vue](frontend/app/pages/index.vue) (`filteredProducts`) |
| Wishlist add / remove | [useCart.ts](frontend/app/composables/useCart.ts), [WishlistDialog.vue](frontend/app/components/WishlistDialog.vue) |
| Shopping cart (multiple products, quantity, remove, badge count, stock limits) | [useCart.ts](frontend/app/composables/useCart.ts), [CartDrawer.vue](frontend/app/components/CartDrawer.vue) |
| Checkout All (order summary, subtotals, total items, total amount, customer form, payment method) | `/checkout`, [checkout.vue](frontend/app/pages/checkout.vue) |
| Server-side stock validation and deduction (transaction) | [backend/src/api/order/controllers/order.js](backend/src/api/order/controllers/order.js) |

## Run locally

Requirements: Node.js 22+ and PostgreSQL (database `ecommerce`, user `postgres`).

```bash
# 1) Backend (http://localhost:1337, admin at /admin)
cd backend
cp .env.example .env        # then edit the secrets / DB password
npm install
npm run develop

# 2) Frontend (http://localhost:3001), in a second terminal
cd frontend
npm install
npm run dev
```

**Or start both with one command** from the main folder:

```bash
npm install     # first time only
npm run dev     # starts backend + frontend together; Ctrl + C stops both
```

On first start, Strapi automatically:
- grants the **Public** role permission to `find`, `findOne`, `create`, `update`, `delete` products and to upload images, and
- inserts **12 sample products with images** if the Product table is empty (set `SEED_DATA=false` to skip).

Open `http://localhost:1337/admin` once to create your Strapi administrator account.

## Deploy to the cloud (Render + Vercel + Cloudinary, all free)

1. **Push this folder to GitHub** (one repository containing `backend/`, `frontend/`, `render.yaml`).
2. **Cloudinary**: sign up at cloudinary.com and copy the *Cloud name*, *API Key* and *API Secret* from the dashboard.
   (Render's disk is wiped on every restart, so images must be stored in Cloudinary.)
3. **Render** (backend + database): Dashboard → **New → Blueprint** → choose the repository.
   Render reads `render.yaml`, creates the free PostgreSQL database and the Strapi service.
   Paste the three Cloudinary values when asked (leave `CORS_ORIGINS` empty for now).
   When the deploy finishes, open `https://<your-service>.onrender.com/admin` and create the admin user.
4. **Vercel** (frontend): **Add New → Project** → import the repository →
   set **Root Directory** to `frontend` → add the environment variable
   `NUXT_PUBLIC_STRAPI_URL = https://<your-service>.onrender.com` → **Deploy**.
5. (Optional) On Render, set `CORS_ORIGINS = https://<your-app>.vercel.app` to allow only your frontend.

> Notes: the free Render service sleeps after 15 minutes of inactivity (the first request then takes about 1 minute),
> and Render's free PostgreSQL expires after 30 days. Open the site a few minutes before the demo.

## Live demonstration script

1. **Homepage** shows products from `GET /api/products?populate=image&filters[isActive][$eq]=true`.
2. **Search** (e.g. "lamp"), click a **category** card or pick from the dropdown, then **All Categories**.
   Tap the **heart** on products, open the **wishlist** (heart in the app bar), and remove one.
3. **Add to Cart** several products. Change quantities in the cart drawer. Try to exceed stock:
   the + button disables, typing a bigger number is capped, and a warning appears.
   Out-of-stock products show a disabled "Out of Stock" button.
4. **Checkout All** shows the order summary with subtotals, total items and total amount.
5. Fill in Full Name, Contact Number (09XXXXXXXXX), Delivery Address, choose a Payment Method and **Place Order**.
6. The success dialog appears, the cart badge resets to 0, and the stock shown on the homepage and in
   Product Management (and Strapi admin → Content Manager → Product) is reduced.
7. **Manage Products**: Add Product with an image, View, Edit (e.g. set Inactive, so it disappears from the homepage), Delete.

## How the important code works (for Q&A)

**Talking to Strapi:** [useStrapi.ts](frontend/app/composables/useStrapi.ts) creates a `$fetch` instance with the
Strapi base URL (from `runtimeConfig.public.strapiUrl`). Strapi 5 returns flat objects identified by `documentId`,
so update/delete use `/api/products/:documentId`. `populate=image` is required because Strapi does not return
media fields by default. `mediaUrl()` prefixes local `/uploads/...` URLs with the Strapi URL (Cloudinary URLs are already absolute).

**Image upload:** two steps: `POST /api/upload` (multipart `FormData` with `files`) returns the file id, then the
product is created/updated with `image: <fileId>`.

**Cart state:** [useCart.ts](frontend/app/composables/useCart.ts) uses Nuxt `useState` (shared across components)
and saves to `localStorage` with a `watch`. `computed` values give `totalItems` and `totalAmount`; every add or
quantity change checks `product.stock`. `syncWithProducts()` refreshes price and stock after products reload and
flags items that became inactive or were deleted.

**Checkout:** [checkout.vue](frontend/app/pages/checkout.vue) validates the form with Vuetify `:rules`, reloads
products to re-check stock, then calls `POST /api/orders/checkout`. The cart is cleared **only** when the
request succeeds; on error the cart is kept, the message is shown, and stock is refreshed.

**Stock deduction (backend):** [order.js controller](backend/src/api/order/controllers/order.js) runs inside
`strapi.db.transaction()`. It locks each product row (`SELECT ... FOR UPDATE`), checks it exists, is active and
has enough stock, then deducts the quantity with the Document Service and saves an **Order**. If any item fails,
a `ValidationError` (HTTP 400) is thrown and the whole transaction rolls back, so no partial stock change happens.
The route ([routes/order.js](backend/src/api/order/routes/order.js)) uses `auth: false` so customers can check out
without logging in, while the orders themselves are only visible to admins.

**Permissions and seeding:** [backend/src/index.js](backend/src/index.js) `bootstrap()` grants the Public role
permissions and seeds sample products, so a fresh cloud deployment works without manual setup.

## Security notes

- All customer data in this project is fictitious test data. Never commit `.env` files (they are git-ignored).
- Product Management has no login in this project, so the Public role can create, update and
  delete products. For a real store, remove those permissions from the Public role and protect `/products` with authentication.
