import { prisma } from "@/lib/models";

export interface PublicReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: Date;
}

export interface ReviewSummary {
  /** Mean rating rounded to one decimal (0 when there are no reviews) */
  average: number;
  count: number;
  reviews: PublicReview[];
}

/**
 * Published reviews + aggregate for a product. Rendered server-side so the
 * content (and the aggregateRating/review JSON-LD derived from it) is in the
 * initial HTML for crawlers.
 */
export async function getProductReviews(
  productId: string,
  take = 50
): Promise<ReviewSummary> {
  const [agg, reviews] = await Promise.all([
    prisma.review.aggregate({
      where: { productId, status: "PUBLISHED" },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.review.findMany({
      where: { productId, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        authorName: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    count: agg._count._all,
    reviews,
  };
}

/**
 * Verified-purchase check: true when the customer has a non-cancelled order
 * whose items include this product. Reviews are gated on this server-side.
 */
export async function hasPurchasedProduct(
  customerId: string,
  productId: string
): Promise<boolean> {
  const orders = await prisma.order.findMany({
    where: { customerId, status: { not: "CANCELLED" } },
    select: { items: true },
  });

  return orders.some((order) => {
    const items = Array.isArray(order.items)
      ? (order.items as Array<{ productId?: string }>)
      : [];
    return items.some((item) => item?.productId === productId);
  });
}
