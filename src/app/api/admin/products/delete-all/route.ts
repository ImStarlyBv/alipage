// DELETE /api/admin/products/delete-all — Wipe every product (and now-orphaned
// imported categories) from the store. Guarded by ADMIN role in middleware.
//
// Safety: requires the request body to contain { confirm: "DELETE ALL PRODUCTS" }
// so an accidental/automated call cannot nuke the catalog.
import { prisma } from "@/lib/models";
import { handleApiError } from "@/lib/utils/api-error";

const CONFIRM_PHRASE = "DELETE ALL PRODUCTS";

export async function DELETE(request: Request) {
  try {
    let confirm: unknown;
    try {
      const body = await request.json();
      confirm = body?.confirm;
    } catch {
      confirm = undefined;
    }

    if (confirm !== CONFIRM_PHRASE) {
      return Response.json(
        {
          error: `Confirmation required. Send { "confirm": "${CONFIRM_PHRASE}" } to wipe the catalog.`,
        },
        { status: 400 }
      );
    }

    // No model holds a foreign key into Product (orders/carts store items as
    // JSON snapshots), so a flat deleteMany is safe and complete.
    const products = await prisma.product.deleteMany({});

    // Categories only exist to group imported products. Once products are gone
    // they are orphaned dropshipping metadata — clear them too so the next
    // niche starts from a clean slate.
    const categories = await prisma.importedCategory.deleteMany({});

    return Response.json({
      ok: true,
      deleted: {
        products: products.count,
        categories: categories.count,
      },
    });
  } catch (err) {
    return handleApiError(err, "DELETE /api/admin/products/delete-all");
  }
}
