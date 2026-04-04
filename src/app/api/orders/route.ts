// GET /api/orders — Customer order history (authenticated)
import { prisma } from "@/lib/models";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const where = { customerId: user.id };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        items: true,
        totalPaid: true,
        currency: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return Response.json({
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
