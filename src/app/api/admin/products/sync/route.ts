// POST /api/admin/products/sync — Sync prices and stock with AliExpress
import { prisma } from "@/lib/models";
import { getProduct } from "@/lib/services/aliexpress/products";

export async function POST() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, aliexpressId: true, markup: true },
  });

  const results: Array<{
    id: string;
    aliexpressId: string;
    status: "updated" | "failed" | "deactivated";
    error?: string;
  }> = [];

  for (const product of products) {
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
        results.push({
          id: product.id,
          aliexpressId: product.aliexpressId,
          status: "deactivated",
        });
        continue;
      }

      const basePrice = parseFloat(
        aeProduct.ae_item_base_info_dto?.prices?.app_sale_price || "0"
      );
      const stock = aeProduct.ae_item_base_info_dto?.num || 0;
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

  const summary = {
    total: results.length,
    updated: results.filter((r) => r.status === "updated").length,
    deactivated: results.filter((r) => r.status === "deactivated").length,
    failed: results.filter((r) => r.status === "failed").length,
  };

  return Response.json({ summary, results });
}
