// POST /api/admin/products/import — Import product from AliExpress by ID
import { prisma } from "@/lib/models";
import { getProduct } from "@/lib/services/aliexpress/products";
import { validateBody, importProductSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/api-error";

export async function POST(request: Request) {
  const { data, error } = await validateBody(request, importProductSchema);
  if (error) return error;

  const { aliexpressId, markup } = data;

  try {

  // Check if product already imported
  const existing = await prisma.product.findUnique({
    where: { aliexpressId: String(aliexpressId) },
  });

  if (existing) {
    return Response.json(
      { error: "Product already imported", product: existing },
      { status: 409 }
    );
  }

  // Fetch from AliExpress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  try {
    result = await getProduct(aliexpressId);
  } catch {
    return Response.json(
      { error: "Failed to fetch product from AliExpress" },
      { status: 502 }
    );
  }

  const aeProduct = result?.aliexpress_ds_product_get_response?.result;
  if (!aeProduct) {
    return Response.json(
      { error: "Product not found on AliExpress" },
      { status: 404 }
    );
  }

  // Extract product data
  // Prices and stock live at SKU level, not base info
  const skus =
    aeProduct.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || [];

  // Use the lowest SKU sale price as the base price
  const skuPrices = skus
    .map((s: Record<string, unknown>) => parseFloat((s.offer_sale_price as string) || "0"))
    .filter((p: number) => p > 0);
  const basePrice = skuPrices.length > 0 ? Math.min(...skuPrices) : 0;
  const salePrice = basePrice * markup;

  // Total stock across all SKUs
  const stock = skus.reduce(
    (sum: number, s: Record<string, unknown>) => sum + ((s.sku_available_stock as number) || 0),
    0
  );

  const images: string[] = (
    aeProduct.ae_multimedia_info_dto?.image_urls || ""
  )
    .split(";")
    .filter(Boolean);

  const product = await prisma.product.create({
    data: {
      aliexpressId: String(aliexpressId),
      title: aeProduct.ae_item_base_info_dto?.subject || "Untitled",
      description: aeProduct.ae_item_base_info_dto?.detail || "",
      images,
      basePrice,
      salePrice,
      markup,
      stock,
      variants: skus.length > 0 ? skus : null,
      active: true,
    },
  });

  return Response.json({ product }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "POST /api/admin/products/import");
  }
}
