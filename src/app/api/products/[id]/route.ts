// GET /api/products/[id] — Product detail (processed data only)
import { prisma } from "@/lib/models";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { id, active: true },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      salePrice: true,
      stock: true,
      variants: true,
      categoryId: true,
      category: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json(product);
}
