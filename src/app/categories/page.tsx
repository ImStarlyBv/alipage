import { prisma } from "@/lib/models";
import Link from "next/link";

export const dynamic = "force-dynamic";

const cardColors = [
  "bg-beige",
  "bg-secondary/20",
  "bg-primary/10",
  "bg-beige",
];

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
      <h1 className="font-heading text-3xl font-bold text-foreground">Categories</h1>

      {categories.length === 0 ? (
        <p className="mt-12 text-center text-foreground/50">
          No categories available yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className={`rounded-xl ${cardColors[i % cardColors.length]} p-6 text-center transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30`}
            >
              <h2 className="font-heading font-semibold text-foreground">{cat.name}</h2>
              <p className="mt-1 text-sm text-foreground/50">
                {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
