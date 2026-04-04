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
      <section className="bg-gray-50 px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Quality Products, Great Prices
        </h1>
        <p className="mx-auto mt-4 max-w-md text-gray-600">
          Discover our curated selection of products shipped worldwide.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <Link
              href="/products"
              className="text-sm text-gray-600 hover:text-black"
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
