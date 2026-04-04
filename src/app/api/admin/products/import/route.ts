// POST /api/admin/products/import — Import product from AliExpress by ID
import { prisma } from "@/lib/models";
import { getProduct } from "@/lib/services/aliexpress/products";

export async function POST(request: Request) {
  const body = await request.json();
  const { aliexpressId, markup = 1.5 } = body;

  if (!aliexpressId) {
    return Response.json(
      { error: "aliexpressId is required" },
      { status: 400 }
    );
  }

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
  const basePrice = parseFloat(
    aeProduct.ae_item_base_info_dto?.prices?.app_sale_price || "0"
  );
  const salePrice = basePrice * markup;
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
      stock: aeProduct.ae_item_base_info_dto?.num || 0,
      variants: aeProduct.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || null,
      active: true,
    },
  });

  return Response.json({ product }, { status: 201 });
}
