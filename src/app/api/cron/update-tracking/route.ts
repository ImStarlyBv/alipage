// GET /api/cron/update-tracking — Update tracking info for placed AliExpress orders
// Intended to be called by an external cron job (e.g., every 1-2 hours).
// Protected by a shared secret in the Authorization header.
import { prisma } from "@/lib/models";
import { getOrder } from "@/lib/services/aliexpress/orders";
import { sendShippingUpdateEmail } from "@/lib/services/email/transactional";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Find orders placed on AliExpress that haven't been delivered yet
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["AE_ORDER_PLACED", "SHIPPED"] },
      aliexpressOrderId: { not: null },
    },
    include: {
      customer: { select: { email: true, name: true } },
    },
    take: 50,
    orderBy: { updatedAt: "asc" },
  });

  const results: Array<{
    orderId: string;
    status: string;
    tracking?: string;
  }> = [];

  for (const order of orders) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aeResponse: any = await getOrder(order.aliexpressOrderId!);
      const aeOrder =
        aeResponse?.aliexpress_ds_trade_order_get_response?.result;

      if (!aeOrder) {
        results.push({ orderId: order.id, status: "no_data" });
        continue;
      }

      const trackingNumber =
        aeOrder.logistics_info_list?.[0]?.logistics_no ||
        aeOrder.tracking_number ||
        order.aliexpressTrackingNumber;
      const aeStatus = aeOrder.order_status || order.aliexpressStatus;

      // Determine new status
      let newStatus = order.status;
      if (
        trackingNumber &&
        order.status === "AE_ORDER_PLACED"
      ) {
        newStatus = "SHIPPED";
      }
      if (
        aeStatus === "FINISH" ||
        aeStatus === "COMPLETED"
      ) {
        newStatus = "DELIVERED";
      }

      const statusChanged = newStatus !== order.status;
      const trackingChanged =
        trackingNumber && trackingNumber !== order.aliexpressTrackingNumber;

      if (statusChanged || trackingChanged) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            ...(statusChanged ? { status: newStatus as "SHIPPED" | "DELIVERED" } : {}),
            ...(trackingChanged
              ? { aliexpressTrackingNumber: trackingNumber }
              : {}),
            aliexpressStatus: aeStatus,
          },
        });

        // Send shipping update email to customer
        if (statusChanged && order.customer.email) {
          sendShippingUpdateEmail({
            to: order.customer.email,
            customerName: order.customer.name,
            orderNumber: order.orderNumber,
            orderId: order.id,
            newStatus: newStatus as string,
            trackingNumber: trackingNumber || undefined,
          }).catch((err) =>
            console.error(`Failed to send shipping email for order ${order.id}:`, err)
          );
        }
      }

      results.push({
        orderId: order.id,
        status: statusChanged ? `${order.status} → ${newStatus}` : "unchanged",
        tracking: trackingNumber || undefined,
      });
    } catch (err) {
      results.push({
        orderId: order.id,
        status: `error: ${err instanceof Error ? err.message : "Unknown"}`,
      });
    }
  }

  return Response.json({
    message: `Checked ${results.length} orders`,
    results,
  });
}
