-- Stable product URLs.
--
-- Slugs used to be derived from `title` at render time and never stored, so
-- renaming a product silently changed its URL and 404'd the already-indexed
-- one. Persist the slug instead, and keep former slugs in
-- ProductSlugRedirect so a rename can 308 instead of 404.
--
-- "slug" is deliberately nullable and populated by the deploy-time backfill
-- (scripts/backfill-product-slugs.js, run from entrypoint.sh after
-- `migrate deploy`). Null is handled at the app layer by falling back to the
-- product id — the URL shape that exists today — so this migration is safe to
-- apply before, during, or after the backfill runs.
--
-- Postgres treats NULLs as distinct in a unique index, so the constraint does
-- not collide across products that have not been backfilled yet.

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "slug" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "metaDescription" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateTable: former product slugs, for 308s after a rename
CREATE TABLE "ProductSlugRedirect" (
    "id" TEXT NOT NULL,
    "fromSlug" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSlugRedirect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSlugRedirect_fromSlug_key" ON "ProductSlugRedirect"("fromSlug");

-- CreateIndex
CREATE INDEX "ProductSlugRedirect_productId_idx" ON "ProductSlugRedirect"("productId");

-- AddForeignKey
ALTER TABLE "ProductSlugRedirect" ADD CONSTRAINT "ProductSlugRedirect_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
