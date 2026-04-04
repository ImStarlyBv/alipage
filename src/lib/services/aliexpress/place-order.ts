/**
 * AliExpress order placement with retry logic and audit logging.
 * Used by both the checkout capture flow and the admin retry endpoint.
 */
import { prisma } from "@/lib/models";
import {
  createOrder as aeCreateOrder,
  type ShippingAddress,
} from "./orders";
import { queryShipping } from "./shipping";
import { notifyAdminOrderFailed } from "@/lib/services/email/admin-notifications";

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 5_000; // 0s, 5s, 15s

interface OrderItem {
  productId: string;
  quantity: number;
  variantId?: string;
}

interface PlaceOrderResult {
  success: boolean;
  aliexpressOrderId?: string;
  error?: string;
}

/**
 * Attempt to place an AliExpress order for every item in the given order.
 * Retries with exponential backoff on failure.
 * Logs every attempt to the OrderLog table.
 */
export async function placeAEOrder(
  orderId: string,
  items: OrderItem[],
  shippingAddress: ShippingAddress
): Promise<PlaceOrderResult> {
  // Mark as in-progress
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PENDING_AE_ORDER" },
  });

  // Resolve product AE IDs and variant SKU attrs
  const resolvedItems = await resolveItems(items);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // Wait with exponential backoff (skip wait on first attempt)
    if (attempt > 1) {
      const delayMs = BACKOFF_BASE_MS * Math.pow(2, attempt - 2); // 5s, 10s
      await sleep(delayMs);
    }

    try {
      // For each item, find a shipping method and create the AE order
      // AliExpress DS API creates one order per product_items call
      const aeOrderIds: string[] = [];

      for (const item of resolvedItems) {
        // Query available shipping to pick the first method
        const shippingResult = await queryShipping(
          item.aliexpressId,
          item.skuId || "0",
          shippingAddress.country,
          item.quantity
        );

        const freightResult =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (shippingResult as any)
            ?.aliexpress_ds_freight_query_response?.result
            ?.freight_list?.freight?.[0];

        const shippingMethod =
          freightResult?.service_name || "CAINIAO_STANDARD";

        const requestData = {
          productId: item.aliexpressId,
          skuAttr: item.skuAttr,
          quantity: item.quantity,
          shippingMethod,
          address: shippingAddress,
        };

        const result = await aeCreateOrder(
          item.aliexpressId,
          item.skuAttr,
          item.quantity,
          shippingMethod,
          shippingAddress
        );

        // Log this attempt
        await logAttempt(orderId, "AE_ORDER_CREATE", attempt, requestData, result, true);

        // Extract AE order ID from response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderResponse = (result as any)
          ?.aliexpress_ds_order_create_response?.result;

        if (orderResponse?.order_id) {
          aeOrderIds.push(String(orderResponse.order_id));
        } else if (orderResponse?.error_code) {
          throw new Error(
            `AE error ${orderResponse.error_code}: ${orderResponse.error_msg || "Unknown"}`
          );
        }
      }

      // All items ordered successfully
      const combinedOrderId = aeOrderIds.join(",");
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "AE_ORDER_PLACED",
          aliexpressOrderId: combinedOrderId,
          failureReason: null,
          retryCount: attempt,
        },
      });

      return { success: true, aliexpressOrderId: combinedOrderId };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      await logAttempt(orderId, "AE_ORDER_CREATE", attempt, null, null, false, errorMsg);

      // On last attempt, mark as failed and notify admin
      if (attempt === MAX_RETRIES) {
        const failedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "AE_ORDER_FAILED",
            failureReason: errorMsg,
            retryCount: attempt,
          },
        });

        notifyAdminOrderFailed({
          id: failedOrder.id,
          orderNumber: failedOrder.orderNumber,
          totalPaid: String(failedOrder.totalPaid),
          failureReason: errorMsg,
          items: failedOrder.items as Array<{ name: string; quantity: number }>,
        }).catch((emailErr) => {
          console.error(`Failed to send admin notification for order ${orderId}:`, emailErr);
        });

        return { success: false, error: errorMsg };
      }

      console.error(
        `AE order attempt ${attempt}/${MAX_RETRIES} failed for order ${orderId}: ${errorMsg}. Retrying...`
      );
    }
  }

  // Should not reach here, but just in case
  return { success: false, error: "Max retries exhausted" };
}

// ─── Helpers ──────────────────────────────────────────────

interface ResolvedItem {
  aliexpressId: string;
  skuAttr: string;
  skuId: string;
  quantity: number;
}

async function resolveItems(items: OrderItem[]): Promise<ResolvedItem[]> {
  const resolved: ResolvedItem[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { aliexpressId: true, variants: true },
    });

    if (!product) {
      throw new Error(`Product ${item.productId} not found in DB`);
    }

    // Find the variant's sku_attr if variantId is specified
    let skuAttr = "";
    let skuId = "0";

    if (item.variantId && product.variants) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variants = product.variants as any[];
      const variant = variants.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v: any) =>
          v.id === item.variantId ||
          v.ae_sku_id === item.variantId ||
          String(v.id) === item.variantId
      );

      if (variant) {
        skuAttr = variant.sku_attr || variant.ae_sku_property_dtos || "";
        skuId = String(variant.ae_sku_id || variant.id || "0");

        // If sku_attr is an array of property DTOs, format it
        if (Array.isArray(skuAttr)) {
          skuAttr = skuAttr
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any) =>
                `${p.sku_property_id}:${p.sku_property_value}`
            )
            .join(";");
        }
      }
    }

    resolved.push({
      aliexpressId: product.aliexpressId,
      skuAttr: typeof skuAttr === "string" ? skuAttr : "",
      skuId,
      quantity: item.quantity,
    });
  }

  return resolved;
}

async function logAttempt(
  orderId: string,
  action: string,
  attempt: number,
  requestData: unknown,
  responseData: unknown,
  success: boolean,
  errorMessage?: string
) {
  await prisma.orderLog.create({
    data: {
      orderId,
      action,
      attempt,
      requestData: requestData ? JSON.parse(JSON.stringify(requestData)) : undefined,
      responseData: responseData ? JSON.parse(JSON.stringify(responseData)) : undefined,
      success,
      errorMessage,
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
