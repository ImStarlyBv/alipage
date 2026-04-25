import { prisma } from "@/lib/models";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import CategoryNav from "@/components/CategoryNav";
import Link from "next/link";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Cat Toys — Shop Interactive, Wand & Chew Toys",
  description:
    "Browse our full collection of cat toys. Interactive toys, wand toys, ball toys, plush toys and more for indoor cats and kittens. Free shipping worldwide.",
  alternates: {
    canonical: "/products",
  },
};

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

  const [products, total, slugProducts] = await Promise.all([
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">Products</h1>

      <div className="mt-4">
        <CategoryNav />
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-foreground/50">
          No products found.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {productsWithSlugs.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/products?page=${page - 1}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className="rounded-full border border-primary/30 px-4 py-1.5 text-sm text-primary-dark transition-colors hover:bg-primary hover:text-white"
                >
                  Previous
                </Link>
              )}
              <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/products?page=${page + 1}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className="rounded-full border border-primary/30 px-4 py-1.5 text-sm text-primary-dark transition-colors hover:bg-primary hover:text-white"
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
