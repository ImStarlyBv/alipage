// POST /api/admin/orders/[id]/retry-ae — Retry AliExpress order creation
import { prisma } from "@/lib/models";
import { placeAEOrder } from "@/lib/services/aliexpress/place-order";
import type { ShippingAddress } from "@/lib/services/aliexpress/orders";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (!["AE_ORDER_FAILED", "PENDING_AE_ORDER"].includes(order.status)) {
    return Response.json(
      { error: `Cannot retry order with status ${order.status}` },
      { status: 400 }
    );
  }

  const shippingAddress = order.shippingAddress as ShippingAddress | null;
  if (!shippingAddress || !shippingAddress.full_name) {
    return Response.json(
      { error: "Order is missing shipping address — cannot create AE order" },
      { status: 400 }
    );
  }

  const items = order.items as Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;

  // Fire-and-forget: placement service handles retries, logging, and status updates
  placeAEOrder(order.id, items, shippingAddress).catch((err) => {
    console.error(`AE order retry failed for order ${order.id}:`, err);
  });

  return Response.json({ message: "Order retry initiated", orderId: id });
}
