// GET /api/products — List products with pagination
import { prisma } from "@/lib/models";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const categoryId = searchParams.get("categoryId");
  const skip = (page - 1) * limit;

  const where = {
    active: true,
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, total, slugProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        images: true,
        basePrice: true,
        salePrice: true,
        stock: true,
        categoryId: true,
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

  return Response.json({
    products: productsWithSlugs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
