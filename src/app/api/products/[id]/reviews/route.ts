// /api/products/[id]/reviews — list published reviews (GET) and submit a
// verified-purchase review (POST). `id` may be a product id or a slug.
import { prisma } from "@/lib/models";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";
import { requireAuth } from "@/lib/auth/session";
import { rateLimit } from "@/lib/utils/rate-limit";
import { validateBody, createReviewSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/api-error";
import { getProductReviews, hasPurchasedProduct } from "@/lib/services/reviews";
import type { NextRequest } from "next/server";

/** Resolve a slug-or-id to the real product id. */
async function resolveProductId(identifier: string): Promise<string | null> {
  const slugProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, title: true },
  });
  const slugMap = buildProductSlugMap(slugProducts);
  const matched = slugProducts.find(
    (p) => p.id === identifier || slugMap.get(p.id) === identifier
  );
  return matched?.id ?? null;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await ctx.params;
    const productId = await resolveProductId(identifier);
    if (!productId) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    const summary = await getProductReviews(productId);
    return Response.json(summary);
  } catch (err) {
    return handleApiError(err, "GET /api/products/[id]/reviews");
  }
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(request, { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  const { data, error } = await validateBody(request, createReviewSchema);
  if (error) return error;

  try {
    const { id: identifier } = await ctx.params;
    const productId = await resolveProductId(identifier);
    if (!productId) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Verified purchase: only buyers of this product may review it.
    const purchased = await hasPurchasedProduct(user.id, productId);
    if (!purchased) {
      return Response.json(
        { error: "Only verified buyers of this product can leave a review." },
        { status: 403 }
      );
    }

    const review = await prisma.review.upsert({
      where: {
        productId_customerId: { productId, customerId: user.id },
      },
      create: {
        productId,
        customerId: user.id,
        rating: data.rating,
        title: data.title?.trim() || null,
        body: data.body.trim(),
        authorName: user.name || "Verified buyer",
      },
      update: {
        rating: data.rating,
        title: data.title?.trim() || null,
        body: data.body.trim(),
      },
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        authorName: true,
        createdAt: true,
      },
    });

    return Response.json(review, { status: 201 });
  } catch (err) {
    return handleApiError(err, "POST /api/products/[id]/reviews");
  }
}
