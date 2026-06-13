import { prisma } from "@/lib/models";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AddToCartButton from "@/components/AddToCartButton";
import ShippingOptions from "@/components/ShippingOptions";
import ImageCarousel from "@/components/ImageCarousel";
import DescriptionGallery from "@/components/DescriptionGallery";
import StickyCartBar from "@/components/StickyCartBar";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";
import { getProductReviews } from "@/lib/services/reviews";
import StarRating from "@/components/reviews/StarRating";
import ReviewForm from "@/components/reviews/ReviewForm";

export const dynamic = "force-dynamic";

async function resolveProduct(identifier: string) {
  const slugProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
    },
  });
  const slugMap = buildProductSlugMap(slugProducts);
  const matchedProduct = slugProducts.find(
    (product) =>
      product.id === identifier || slugMap.get(product.id) === identifier
  );

  if (!matchedProduct) return null;

  const canonicalSlug = slugMap.get(matchedProduct.id) || matchedProduct.id;
  return { matchedProduct, canonicalSlug };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: identifier } = await params;
  const resolved = await resolveProduct(identifier);

  if (!resolved) {
    return { title: "Product Not Found" };
  }

  const product = await prisma.product.findUnique({
    where: { id: resolved.matchedProduct.id, active: true },
    select: {
      title: true,
      salePrice: true,
      images: true,
      category: { select: { name: true } },
    },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  const price = Number(product.salePrice);
  const images = Array.isArray(product.images)
    ? (product.images as string[]).slice(0, 3)
    : [];
  const categoryPrefix = product.category
    ? `${product.category.name} — `
    : "";

  return {
    title: product.title,
    description: `Shop ${product.title} at Kitty Control for $${price.toFixed(2)} with free worldwide shipping. ${categoryPrefix}Soft, breathable sphynx cat clothing made for hairless cats.`,
    alternates: {
      canonical: `/products/${resolved.canonicalSlug}`,
    },
    openGraph: {
      title: `${product.title} — $${price.toFixed(2)}`,
      description: `${product.title} — $${price.toFixed(2)} with free worldwide shipping. Sphynx cat clothes for hairless cats at Kitty Control.`,
      images: images,
      type: "website",
      url: `https://kittycontrol.shop/products/${resolved.canonicalSlug}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: identifier } = await params;
  const slugProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
    },
  });
  const slugMap = buildProductSlugMap(slugProducts);
  const matchedProduct = slugProducts.find(
    (product) =>
      product.id === identifier || slugMap.get(product.id) === identifier
  );

  if (!matchedProduct) notFound();

  const canonicalSlug = slugMap.get(matchedProduct.id) || matchedProduct.id;
  if (identifier !== canonicalSlug) {
    redirect(`/products/${canonicalSlug}`);
  }

  const product = await prisma.product.findUnique({
    where: { id: matchedProduct.id, active: true },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      salePrice: true,
      stock: true,
      variants: true,
      category: { select: { id: true, name: true } },
    },
  });

  if (!product) notFound();

  const { average, count, reviews } = await getProductReviews(product.id);

  const images = product.images as string[];
  const price = Number(product.salePrice);
  // AE SKU variants: group by property name for display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSkus = (product.variants as any[] | null) || [];
  const variantMap = new Map<string, Set<string>>();
  for (const sku of rawSkus) {
    const props =
      sku.ae_sku_property_dtos?.ae_sku_property_d_t_o || [];
    for (const prop of props) {
      const name = prop.sku_property_name as string;
      const value = (prop.property_value_definition_name || prop.sku_property_value) as string;
      if (!variantMap.has(name)) variantMap.set(name, new Set());
      variantMap.get(name)!.add(value);
    }
  }
  const variants = Array.from(variantMap.entries()).map(([name, values]) => ({
    id: name,
    name,
    values: Array.from(values),
  }));

  // Breadcrumb data
  const breadcrumbItems = [
    { name: "Home", url: "https://kittycontrol.shop" },
    { name: "Sphynx Cat Clothes", url: "https://kittycontrol.shop/products" },
  ];
  if (product.category) {
    breadcrumbItems.push({
      name: product.category.name,
      url: `https://kittycontrol.shop/products?categoryId=${product.category.id}`,
    });
  }
  breadcrumbItems.push({
    name: product.title,
    url: `https://kittycontrol.shop/products/${canonicalSlug}`,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:pb-8 md:pt-8">
      {/* JSON-LD Structured Data */}
      <ProductJsonLd
        product={{
          title: product.title,
          description: product.description,
          images,
          salePrice: price,
          stock: product.stock,
          slug: canonicalSlug,
          category: product.category,
        }}
        rating={count > 0 ? { average, count } : undefined}
        reviews={reviews}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Breadcrumb Navigation */}
      <nav className="mb-4 text-xs text-foreground/50" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <a href="/" className="hover:text-primary-dark transition-colors">Home</a>
          </li>
          <li className="before:content-['/'] before:mx-1">
            <a href="/products" className="hover:text-primary-dark transition-colors">Sphynx Cat Clothes</a>
          </li>
          {product.category && (
            <li className="before:content-['/'] before:mx-1">
              <a
                href={`/products?categoryId=${product.category.id}`}
                className="hover:text-primary-dark transition-colors"
              >
                {product.category.name}
              </a>
            </li>
          )}
          <li className="before:content-['/'] before:mx-1 text-foreground/80">
            <span className="line-clamp-1">{product.title}</span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Image carousel */}
        <ImageCarousel images={images} alt={`${product.title} — Sphynx Cat Clothes`} />

        {/* Product info */}
        <div>
          {product.category && (
            <span className="inline-block rounded-full bg-secondary/40 px-3 py-0.5 text-xs font-medium text-foreground/70">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-2 font-heading text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            {product.title}
          </h1>
          {count > 0 && (
            <a
              href="#reviews"
              className="mt-2 inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary-dark"
            >
              <StarRating value={average} />
              <span className="font-medium">{average.toFixed(1)}</span>
              <span className="text-foreground/50">
                ({count} review{count !== 1 ? "s" : ""})
              </span>
            </a>
          )}
          <p className="mt-2 text-2xl font-bold text-primary-dark sm:mt-3 sm:text-3xl">
            ${price.toFixed(2)}
          </p>

          {product.stock > 0 ? (
            <p className="mt-1 text-sm font-medium text-primary-dark">In Stock</p>
          ) : (
            <p className="mt-1 text-sm font-medium text-secondary">Out of Stock</p>
          )}

          {/* Variants display */}
          {variants && variants.length > 0 && (
            <div className="mt-5 space-y-3">
              {variants.map((variant) => (
                <div key={variant.id}>
                  <p className="text-sm font-medium text-foreground/70">{variant.name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {variant.values.map((val) => (
                      <span
                        key={val}
                        className="rounded-full border border-primary/30 px-3 py-1 text-xs transition-colors hover:border-primary hover:bg-primary/10"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              disabled={product.stock === 0}
            />
          </div>

          {/* Shipping options */}
          <div className="mt-6 rounded-xl bg-beige p-4">
            <ShippingOptions productId={product.id} />
          </div>

          {/* Description */}
          <div className="mt-8 border-t border-secondary/30 pt-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Product Description
            </h2>
            <div className="mt-3">
              <DescriptionGallery html={product.description} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ Reviews (server-rendered for crawlers) ═══════════════ */}
      <section id="reviews" className="mt-12 border-t border-secondary/30 pt-8 scroll-mt-24">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          Customer Reviews
        </h2>

        {count > 0 ? (
          <div className="mt-3 flex items-center gap-3">
            <StarRating value={average} size="text-xl" />
            <span className="text-lg font-bold text-foreground">
              {average.toFixed(1)}
            </span>
            <span className="text-sm text-foreground/50">
              based on {count} review{count !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-sm text-foreground/60">
            No reviews yet — if you&apos;ve bought this, be the first to review it.
          </p>
        )}

        {reviews.length > 0 && (
          <ul className="mt-6 space-y-5">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-secondary/30 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {r.authorName}
                  </span>
                  <time
                    className="text-xs text-foreground/50"
                    dateTime={new Date(r.createdAt).toISOString().split("T")[0]}
                  >
                    {new Date(r.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="mt-1">
                  <StarRating value={r.rating} size="text-sm" />
                </div>
                {r.title && (
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {r.title}
                  </p>
                )}
                <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 max-w-xl">
          <ReviewForm productId={product.id} slug={canonicalSlug} />
        </div>
      </section>

      {/* Sticky mobile cart bar */}
      <StickyCartBar
        productId={product.id}
        price={price}
        disabled={product.stock === 0}
      />
    </div>
  );
}
