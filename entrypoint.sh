#!/bin/sh
# Fail fast: the app reads Product.slug, so booting against an unmigrated schema
# is worse than not booting at all.
set -e

npx prisma migrate deploy

# Freeze each product's current URL into Product.slug. Idempotent and only ever
# fills NULLs, so this is a no-op after the first run.
#
# Non-fatal on purpose: a product with no slug falls back to its id-based URL,
# which is the shape the site served before slugs were stored — so a failed
# backfill degrades to the old behaviour rather than blocking the deploy.
node scripts/backfill-product-slugs.js --apply || \
  echo "WARN: slug backfill failed; products without a slug fall back to id URLs."

node server.js
