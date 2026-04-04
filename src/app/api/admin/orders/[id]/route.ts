// GET /api/admin/orders/[id] — Full order detail for admin (includes logs, address, items with SKU IDs)
import { prisma } from "@/lib/models";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      logs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(order);
}
