import { prisma } from "@/lib/models";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ShippingOptions from "@/components/ShippingOptions";
import ImageCarousel from "@/components/ImageCarousel";
import DescriptionGallery from "@/components/DescriptionGallery";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, active: true },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image carousel */}
        <ImageCarousel images={images} alt={product.title} />

        {/* Product info */}
        <div>
          {product.category && (
            <span className="inline-block rounded-full bg-secondary/40 px-3 py-0.5 text-xs font-medium text-foreground/70">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-2 font-heading text-2xl font-bold text-foreground md:text-3xl">
            {product.title}
          </h1>
          <p className="mt-3 text-3xl font-bold text-primary-dark">
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
              Description
            </h2>
            <div className="mt-3">
              <DescriptionGallery html={product.description} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
