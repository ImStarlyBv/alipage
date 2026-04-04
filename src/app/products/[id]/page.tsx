import { prisma } from "@/lib/models";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import ShippingOptions from "@/components/ShippingOptions";

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
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded bg-gray-100"
                >
                  <Image
                    src={img}
                    alt={`${product.title} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="10vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {product.category && (
            <p className="text-sm text-gray-500">{product.category.name}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold">{product.title}</h1>
          <p className="mt-3 text-3xl font-bold">${price.toFixed(2)}</p>

          {product.stock > 0 ? (
            <p className="mt-1 text-sm text-green-600">In Stock</p>
          ) : (
            <p className="mt-1 text-sm text-red-600">Out of Stock</p>
          )}

          {/* Variants display */}
          {variants && variants.length > 0 && (
            <div className="mt-4 space-y-3">
              {variants.map((variant) => (
                <div key={variant.id}>
                  <p className="text-sm font-medium">{variant.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {variant.values.map((val) => (
                      <span
                        key={val}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
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
          <div className="mt-6">
            <ShippingOptions productId={product.id} />
          </div>

          {/* Description */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <div
              className="mt-2 text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
