# Error Fixes Log

## Deployment & Docker

1. **Prisma client path mismatch** — Dockerfile was copying from `node_modules/.prisma` but schema outputs to `src/generated/prisma`. Fixed COPY path.

2. **`sh: prisma: not found`** — `npx` not available in standalone runner stage. Fixed by installing `prisma` and `dotenv` directly in the runner stage with `npm install`.

3. **Missing `pathe` module** — Copying individual prisma node_modules missed transitive deps. Fixed by doing a full `npm install prisma dotenv` in runner instead of cherry-picking modules.

4. **EACCES: permission denied, mkdir `/app/.next/cache`** — `nextjs` user (uid 1001) couldn't write to `.next/cache`. Fixed by adding `mkdir -p .next/cache && chown -R nextjs:nodejs .next` before switching to `nextjs` user.

5. **Postgres POSTGRES_PASSWORD not supplied** — `.env` is gitignored, so Coolify had no env vars. Fix: add all env vars in Coolify's dashboard.

## PayPal

6. **401 Client Authentication failed** — PayPal SDK was using `Environment.Production` because `NODE_ENV=production` in Docker, but credentials are sandbox. Fixed by using `PAYPAL_MODE` env var instead of `NODE_ENV` to select sandbox/live. Defaults to sandbox.

## AliExpress API

7. **Product import: price always 0, stock always 0** — Import route read price from `ae_item_base_info_dto.prices.app_sale_price` and stock from `ae_item_base_info_dto.num`, neither of which exist. Prices are at SKU level (`offer_sale_price`), stock is `sku_available_stock` per SKU. Fixed to use lowest SKU price and sum all SKU stocks.

8. **`Cannot read properties of undefined (reading 'map')` on product detail** — Page expected variants shaped as `{ id, name, values[] }` but AE returns `{ sku_attr, ae_sku_property_dtos... }`. Fixed by parsing actual AE SKU structure and grouping properties by name.

9. **`MissingParameter: param_place_order_request4_open_api_d_t_o`** — Order create was sending `logistics_address` and `product_items` as top-level params. API expects them wrapped under `param_place_order_request4_open_api_d_t_o`. Fixed by wrapping in a single JSON param.

10. **`SKU_NOT_EXIST` on order create** — No `variantId` was being sent from cart, so `sku_attr` was empty. Fixed `resolveItems` to default to the first SKU when no variant is selected, and use correct field names (`sku_attr`, `sku_id`).

11. **`B_DROPSHIPPER_DELIVERY_ADDRESS_VALIDATE_FAIL` — country code invalid** — Country field was free text (user typed "Rep\u00fablica Dominicana" instead of "DO"). Fixed by replacing with a dropdown of ISO country codes that auto-fills phone country code.

12. **`product_count` and `product_id` as numbers** — AE API expects string values. Fixed to `String(quantity)` and `String(productId)`.

## Frontend

13. **Country dropdown not updating visually** — `updateAddress` called twice in onChange handler; second call overwrote country with stale state. Fixed by setting both `country` and `phone_country` in a single state update.

14. **Import page only accepted product IDs** — Changed to accept full AliExpress URLs, auto-extracting the product ID from `/item/{id}` pattern.
