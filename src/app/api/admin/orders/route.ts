// GET /api/admin/orders — All orders with status filter
import { prisma } from "@/lib/models";
import { OrderStatus } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const status = searchParams.get("status") as OrderStatus | null;
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return Response.json({
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
