// GET /api/categories — List imported categories
import { prisma } from "@/lib/models";

export async function GET() {
  const categories = await prisma.importedCategory.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: { name: "asc" },
  });

  return Response.json({ categories });
}
