// GET /api/products/[id] — Product detail (processed data only)
import { prisma } from "@/lib/models";
import { resolveProductId } from "@/lib/services/products";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: identifier } = await ctx.params;
  const productId = await resolveProductId(identifier);

  if (!productId) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId, active: true },
    select: {
      id: true,
      title: true,
      slug: true,
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
    slug: product.slug ?? product.id,
  });
}
