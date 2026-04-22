import Link from "next/link";
import { prisma } from "@/lib/models";
import ProductCard from "@/components/ProductCard";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, slugProducts] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        images: true,
        salePrice: true,
        stock: true,
      },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        title: true,
      },
    }),
  ]);
  const slugMap = buildProductSlugMap(slugProducts);
  const productsWithSlugs = products.map((product) => ({
    ...product,
    slug: slugMap.get(product.id) || product.id,
  }));

  return (
    <div>
      {/* Hero */}
      <section className="bg-beige px-4 py-12 text-center sm:py-16 md:py-20">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
          Quality Products, Great Prices
        </h1>
        <p className="mx-auto mt-4 max-w-md text-foreground/60">
          Discover our curated selection of products shipped worldwide.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              New Arrivals
            </h2>
            <Link
              href="/products"
              className="text-sm text-primary-dark transition-colors hover:text-primary"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {productsWithSlugs.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
