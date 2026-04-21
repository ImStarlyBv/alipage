// PATCH /api/admin/products/[id]/images — Replace product images array
import { prisma } from "@/lib/models";
import { validateBody } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/api-error";
import { z } from "zod";

const updateImagesSchema = z.object({
  images: z.array(z.string().url()).min(1, "At least one image URL required"),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await validateBody(request, updateImagesSchema);
  if (error) return error;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { images: data.images },
      select: { id: true, title: true, images: true },
    });

    return Response.json({ product: updated });
  } catch (err) {
    return handleApiError(err, `PATCH /api/admin/products/${id}/images`);
  }
}
