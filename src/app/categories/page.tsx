import { prisma } from "@/lib/models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.importedCategory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Categories</h1>

      {categories.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          No categories available yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="rounded-lg border border-gray-200 p-6 text-center transition-shadow hover:shadow-md"
            >
              <h2 className="font-semibold">{cat.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
