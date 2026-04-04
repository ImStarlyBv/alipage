import Link from "next/link";
import { prisma } from "@/lib/models";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({
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
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-beige px-4 py-20 text-center">
        <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground md:text-6xl">
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
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
