import { prisma } from "@/lib/models";
import ProductCard from "@/components/ProductCard";
import CategoryNav from "@/components/CategoryNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoryId?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;
  const categoryId = params.categoryId || undefined;

  const where = {
    active: true,
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        images: true,
        salePrice: true,
        stock: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Products</h1>

      <div className="mt-4">
        <CategoryNav />
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          No products found.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/products?page=${page - 1}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/products?page=${page + 1}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
