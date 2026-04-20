// PATCH /api/admin/products/[id]/rename — Update product title for SEO
import { prisma } from "@/lib/models";
import { handleApiError } from "@/lib/utils/api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body as Record<string, unknown>)?.title;
  if (typeof title !== "string" || title.trim().length === 0) {
    return Response.json({ error: "title is required and must be a non-empty string" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { title: title.trim() },
      select: { id: true, title: true, aliexpressId: true },
    });

    return Response.json({ product: updated });
  } catch (err) {
    return handleApiError(err, `PATCH /api/admin/products/${id}/rename`);
  }
}
