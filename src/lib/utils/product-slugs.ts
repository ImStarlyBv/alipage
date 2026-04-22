type ProductSlugSource = {
  id: string;
  title: string;
};

function slugifyTitle(title: string) {
  const normalized = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "product";
}

export function buildProductSlugMap<T extends ProductSlugSource>(products: T[]) {
  const slugMap = new Map<string, string>();
  const counts = new Map<string, number>();

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

export function getProductSlug<T extends ProductSlugSource>(
  products: T[],
  productId: string
) {
  return buildProductSlugMap(products).get(productId);
}
