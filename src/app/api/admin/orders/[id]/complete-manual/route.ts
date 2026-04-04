// POST /api/admin/orders/[id]/complete-manual — Mark order as manually completed
import { prisma } from "@/lib/models";
import { validateBody, completeManualSchema } from "@/lib/utils/validation";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { data, error } = await validateBody(req, completeManualSchema);
  if (error) return error;

  const { aliexpressOrderId, trackingNumber } = data;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "REFUNDED" || order.status === "CANCELLED") {
    return Response.json(
      { error: `Cannot complete order with status ${order.status}` },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id },
    data: {
      aliexpressOrderId: aliexpressOrderId || null,
      aliexpressTrackingNumber: trackingNumber || null,
      status: trackingNumber ? "SHIPPED" : "AE_ORDER_PLACED",
      manuallyCompleted: true,
    },
  });

  return Response.json({ message: "Order marked as manually completed" });
}
