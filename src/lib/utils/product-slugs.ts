export function slugifyTitle(title: string) {
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
 * First candidate not already spoken for. Starts at the bare slug and appends
 * `-2`, `-3`, … so the oldest product keeps the un-suffixed URL.
 *
 * `scripts/backfill-product-slugs.js` has the same rule in CommonJS — it runs
 * from the container entrypoint, where this module isn't on disk — so a parity
 * test holds the two in lockstep. A product created through the admin import
 * and one backfilled at deploy time must land on the same URL.
 */
export function findFreeSlug(baseSlug: string, taken: Set<string>) {
  if (!taken.has(baseSlug)) return baseSlug;

  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}
