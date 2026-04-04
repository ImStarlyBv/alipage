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
      country,
      1,
      product.salePrice.toString()
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch shipping options" },
      { status: 502 }
    );
  }

  // Return only the processed shipping options
  const freightResult =
    result?.aliexpress_ds_freight_query_response?.result;
  const freightList = freightResult?.freight_list || [];
  const options = freightList.map(
    (opt: { service_name: string; estimated_delivery_time: string; freight: { cent: number; currency: string } }) => ({
      serviceName: opt.service_name,
      estimatedDelivery: opt.estimated_delivery_time,
      cost: opt.freight,
    })
  );

  return Response.json({ options });
}
