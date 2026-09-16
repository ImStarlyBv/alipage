import { prisma } from "@/lib/models";
import { findFreeSlug, slugifyTitle } from "@/lib/utils/product-slugs";

/**
 * Pick the URL slug for a product being created: its slugified title, with
 * `-2`, `-3`, … appended if that is taken.
 *
 * Runs at creation so a new product is published on its real URL rather than on
 * its id. The deploy-time backfill would eventually give it the same slug, but
 * only after the next boot — and by then a crawler may already have the id URL.
 * `findFreeSlug` is shared with that backfill, so both agree on the tie-break.
 *
 * A concurrent create could still win the same slug; the unique index rejects
 * it and the caller sees a constraint error rather than two products on one URL.
 */
export async function assignProductSlug(title: string): Promise<string> {
  const base = slugifyTitle(title);

  const rows = await prisma.product.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });

  return findFreeSlug(base, new Set(rows.map((row) => row.slug as string)));
}

/**
 * Resolve a URL segment to a product id.
 *
 * Three ways a segment can name a product: its stored slug (the normal case),
 * its id (legacy `/products/<cuid>` links, still in the wild), or a former slug
 * that has a ProductSlugRedirect row pointing at where the product moved to.
 * A segment matching none of them — or matching an inactive product — is null.
 */
export async function resolveProductId(
  identifier: string
): Promise<string | null> {
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: identifier }, { id: identifier }], active: true },
    select: { id: true },
  });

  if (product) return product.id;

  const former = await prisma.productSlugRedirect.findFirst({
    where: { fromSlug: identifier, product: { active: true } },
    select: { product: { select: { id: true } } },
  });

  return former?.product.id ?? null;
}
