/**
 * CommonJS port of `src/lib/utils/product-slugs.ts`.
 *
 * Deploy-time scripts run from the standalone runner image, which ships
 * `scripts/` and `prisma/` but has no loose `src/lib/**` files, so the backfill
 * cannot import the TypeScript implementation. The two are held in lockstep by
 * `src/lib/seo/__tests__/product-slug-parity.test.ts`, which runs a corpus that
 * includes every live product title through both and asserts byte equality.
 *
 * If you change the algorithm, change it in both places.
 */

function slugifyTitle(title) {
  const normalized = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "product";
}

/**
 * Assign a unique slug per product, in array order. Duplicates get `-2`, `-3`,
 * … suffixed to the second and later occurrence, so the oldest product keeps
 * the bare slug.
 */
function buildProductSlugMap(products) {
  const slugMap = new Map();
  const counts = new Map();

  for (const product of products) {
    const baseSlug = slugifyTitle(product.title);
    const nextCount = (counts.get(baseSlug) || 0) + 1;
    counts.set(baseSlug, nextCount);

    slugMap.set(
      product.id,
      nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`
    );
  }

  return slugMap;
}

module.exports = { slugifyTitle, buildProductSlugMap };
