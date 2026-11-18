# ShopKart API (Strapi 5 + PostgreSQL)

Backend for the ShopKart e-commerce store (Web Systems and Technologies final project).
The storefront is in the separate `ecomm-frontend` repository.

## What it provides

| Endpoint | Purpose |
|---|---|
| `GET /api/products?populate=image` | Products with their images (Public) |
| `POST/PUT/DELETE /api/products` | Product Management CRUD (Public, rate limited) |
| `POST /api/upload` | Upload a product image (Public) |
| `POST /api/orders/checkout` | Checkout All: validates stock, deducts it in one transaction, saves the order (rate limited: 10/min per visitor) |
| `GET /_health` | Health check for Render and UptimeRobot (204) |

Important files:
- `src/api/order/controllers/order.js`: checkout logic (validation, row locking, stock deduction).
- `src/index.js`: grants Public permissions and seeds sample products on an empty database.
- `src/middlewares/rate-limit.js`: per-IP rate limiter.
- `config/plugins.js`: Cloudinary uploads when all `CLOUDINARY_*` variables are set; images only (JPEG, PNG, WebP, GIF, AVIF, max 5 MB).

## Run locally

Requires Node.js 22+ and PostgreSQL with a database named `ecommerce`.

```bash
cp .env.example .env   # then set your own secrets and DB password
npm install
npm run develop        # http://localhost:1337/admin
```

## Deploy

Render reads `render.yaml` (New → Blueprint). Database: Neon (direct connection string in `DATABASE_URL`).
Images: Cloudinary. Never commit `.env`.
