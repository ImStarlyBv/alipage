// GET /api/orders/[id] — Order detail with tracking (processed data)
import { prisma } from "@/lib/models";
import { requireAuth } from "@/lib/auth/session";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const order = await prisma.order.findUnique({
    where: { id, customerId: user.id },
    select: {
      id: true,
      orderNumber: true,
      items: true,
      totalPaid: true,
      currency: true,
      status: true,
      aliexpressTrackingNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(order);
}
