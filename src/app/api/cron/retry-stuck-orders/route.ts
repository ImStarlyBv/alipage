// GET /api/cron/retry-stuck-orders — Periodic review of stuck orders
// Intended to be called by an external cron job (e.g., every 30 min).
// Protected by a shared secret in the Authorization header.
import { prisma } from "@/lib/models";
import { placeAEOrder } from "@/lib/services/aliexpress/place-order";
import type { ShippingAddress } from "@/lib/services/aliexpress/orders";

const CRON_SECRET = process.env.CRON_SECRET;
const MAX_RETRY_COUNT = 5;
const STUCK_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(request: Request) {
  // Verify cron secret
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const stuckSince = new Date(Date.now() - STUCK_THRESHOLD_MS);

  // Find orders that are stuck: failed or pending for too long, with room for retries
  const stuckOrders = await prisma.order.findMany({
    where: {
      status: { in: ["AE_ORDER_FAILED", "PENDING_AE_ORDER"] },
      retryCount: { lt: MAX_RETRY_COUNT },
      updatedAt: { lt: stuckSince },
      shippingAddress: { not: { equals: null } },
    },
    take: 10, // Process in batches
    orderBy: { updatedAt: "asc" },
  });

  const results: Array<{ orderId: string; status: string }> = [];

  for (const order of stuckOrders) {
    const items = order.items as Array<{
      productId: string;
      quantity: number;
      variantId?: string;
    }>;
    const address = order.shippingAddress as unknown as ShippingAddress;

    // Fire-and-forget — placement service handles logging and status updates
    placeAEOrder(order.id, items, address).catch((err) => {
      console.error(`Cron retry failed for order ${order.id}:`, err);
    });

    results.push({ orderId: order.id, status: "retry_initiated" });
  }

  return Response.json({
    message: `Processed ${results.length} stuck orders`,
    results,
  });
}
