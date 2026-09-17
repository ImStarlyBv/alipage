// GET /api/cron/sync-products — Periodic price/stock sync with AliExpress
// Intended to be called by an external cron job (e.g., every 6-12 hours).
// Protected by a shared secret in the Authorization header.
import { prisma } from "@/lib/models";
import { getProduct } from "@/lib/services/aliexpress/products";
import { revalidatePath } from "next/cache";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, aliexpressId: true, markup: true, slug: true },
  });

  const results: Array<{
    id: string;
    aliexpressId: string;
    status: "updated" | "failed" | "deactivated";
    error?: string;
  }> = [];

  let anyChanged = false;

  for (const product of products) {
    const productPath = `/products/${product.slug ?? product.id}`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;
      try {
        result = await getProduct(product.aliexpressId);
      } catch {
        await prisma.product.update({
          where: { id: product.id },
          data: { active: false },
        });
        revalidatePath(productPath);
        anyChanged = true;
        results.push({
          id: product.id,
          aliexpressId: product.aliexpressId,
          status: "deactivated",
          error: "Could not fetch from AliExpress",
        });
        continue;
      }

      const aeProduct = result?.aliexpress_ds_product_get_response?.result;
      if (!aeProduct) {
        await prisma.product.update({
          where: { id: product.id },
          data: { active: false },
        });
        revalidatePath(productPath);
        anyChanged = true;
        results.push({
          id: product.id,
          aliexpressId: product.aliexpressId,
          status: "deactivated",
        });
        continue;
      }

      // Use SKU-level pricing (same logic as import)
      const skus =
        aeProduct.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || [];
      const skuPrices = skus
        .map((s: Record<string, unknown>) =>
          parseFloat((s.offer_sale_price as string) || "0")
        )
        .filter((p: number) => p > 0);
      const basePrice =
        skuPrices.length > 0 ? Math.min(...skuPrices) : 0;
      const stock = skus.reduce(
        (sum: number, s: Record<string, unknown>) =>
          sum + ((s.sku_available_stock as number) || 0),
        0
      );
      const markupValue = Number(product.markup);

      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice,
          salePrice: basePrice * markupValue,
          stock,
          active: stock > 0,
        },
      });
      revalidatePath(productPath);
      anyChanged = true;

      results.push({
        id: product.id,
        aliexpressId: product.aliexpressId,
        status: stock > 0 ? "updated" : "deactivated",
      });
    } catch (err) {
      results.push({
        id: product.id,
        aliexpressId: product.aliexpressId,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // Home, /products and every collection page show price/stock, and are ISR —
  // without this a sync would sit invisible until the hour elapsed. One call
  // per surface, not per product: cheap, and simpler than tracking which of
  // the 4 collections each changed product actually belongs to.
  if (anyChanged) {
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/[collection]", "page");
  }

  const summary = {
    total: results.length,
    updated: results.filter((r) => r.status === "updated").length,
    deactivated: results.filter((r) => r.status === "deactivated").length,
    failed: results.filter((r) => r.status === "failed").length,
  };

  return Response.json({ summary, results });
}
