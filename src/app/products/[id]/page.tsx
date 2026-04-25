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
    title: `${product.title} — Buy Cat Toy Online`,
    description: `Shop ${product.title} at Kitty Control. $${price.toFixed(2)} with free shipping. ${categoryPrefix}Interactive cat toy perfect for indoor cats and kittens.`,
    alternates: {
      canonical: `/products/${resolved.canonicalSlug}`,
    },
    openGraph: {
      title: `${product.title} — $${price.toFixed(2)}`,
      description: `${product.title} — $${price.toFixed(2)} with free worldwide shipping. Shop the best cat toys at Kitty Control.`,
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
    { name: "Cat Toys", url: "https://kittycontrol.shop/products" },
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
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Breadcrumb Navigation */}
      <nav className="mb-4 text-xs text-foreground/50" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <a href="/" className="hover:text-primary-dark transition-colors">Home</a>
          </li>
          <li className="before:content-['/'] before:mx-1">
            <a href="/products" className="hover:text-primary-dark transition-colors">Cat Toys</a>
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
        <ImageCarousel images={images} alt={`${product.title} — Cat Toy`} />

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

      {/* Sticky mobile cart bar */}
      <StickyCartBar
        productId={product.id}
        price={price}
        disabled={product.stock === 0}
      />
    </div>
  );
}
