// PATCH /api/admin/products/[id] — Update product price, markup, or active status
import { prisma } from "@/lib/models";
import { validateBody, updateProductSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await validateBody(request, updateProductSchema);
  if (error) return error;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (data.salePrice !== undefined) {
      updateData.salePrice = data.salePrice;
    }

    if (data.markup !== undefined) {
      updateData.markup = data.markup;
      if (data.salePrice === undefined) {
        updateData.salePrice = Number(product.basePrice) * data.markup;
      }
    }

    if (data.active !== undefined) {
      updateData.active = data.active;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ product: updated });
  } catch (err) {
    return handleApiError(err, `PATCH /api/admin/products/${id}`);
  }
}
