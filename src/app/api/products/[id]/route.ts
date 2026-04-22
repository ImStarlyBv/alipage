// GET /api/products/[id] — Product detail (processed data only)
import { prisma } from "@/lib/models";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: identifier } = await ctx.params;
  const slugProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
    },
  });
  const slugMap = buildProductSlugMap(slugProducts);
  const matchedProduct = slugProducts.find(
    (product) =>
      product.id === identifier || slugMap.get(product.id) === identifier
  );

  if (!matchedProduct) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id: matchedProduct.id, active: true },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      salePrice: true,
      stock: true,
      variants: true,
      categoryId: true,
      aliexpressId: true,
      category: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({
    ...product,
    slug: slugMap.get(product.id) || product.id,
  });
}
