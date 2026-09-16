/**
 * CommonJS mirror of `src/lib/utils/product-slugs.ts`.
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
    .replace(/-{2,}/g, "");

  return normalized || "product";
}

/**
 * First candidate not already spoken for. Starts at the bare slug and appends
 * `-2`, `-3`, … so the oldest product keeps the un-suffixed URL.
 */
function findFreeSlug(baseSlug, taken) {
  if (!taken.has(baseSlug)) return baseSlug;

  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}

module.exports = { slugifyTitle, findFreeSlug };
