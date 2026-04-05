// GET /api/products/[id]/shipping — Shipping options (calls AE server-side)
import { prisma } from "@/lib/models";
import { queryShipping } from "@/lib/services/aliexpress/shipping";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "US";
  const skuId = searchParams.get("skuId");

  if (!skuId) {
    return Response.json({ error: "skuId is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id, active: true },
    select: { aliexpressId: true, salePrice: true },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  try {
    result = await queryShipping(
      product.aliexpressId,
      skuId,
      country
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch shipping options" },
      { status: 502 }
    );
  }

  const freightResult =
    result?.aliexpress_ds_freight_query_response?.result;

  if (!freightResult?.success) {
    return Response.json({ options: [] });
  }

  const deliveryOptions =
    freightResult?.delivery_options?.delivery_option_d_t_o || [];

  const options = deliveryOptions.map(
    (opt: {
      company: string;
      shipping_fee_cent: string;
      shipping_fee_currency: string;
      shipping_fee_format: string;
      min_delivery_days: number;
      max_delivery_days: number;
      delivery_date_desc: string;
      free_shipping: boolean;
      tracking: boolean;
      code: string;
    }) => ({
      serviceName: opt.company,
      code: opt.code,
      cost: opt.free_shipping ? 0 : parseFloat(opt.shipping_fee_cent || "0"),
      costFormatted: opt.free_shipping ? "Free" : opt.shipping_fee_format,
      currency: opt.shipping_fee_currency,
      deliveryDays: `${opt.min_delivery_days}-${opt.max_delivery_days}`,
      deliveryDate: opt.delivery_date_desc,
      freeShipping: opt.free_shipping,
      tracking: opt.tracking,
    })
  );

  return Response.json({ options });
}
