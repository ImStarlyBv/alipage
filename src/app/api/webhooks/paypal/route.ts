// POST /api/webhooks/paypal — PayPal webhook handler (signature verified server-side)
import { verifyWebhookSignature } from "@/lib/services/paypal/webhooks";
import { prisma } from "@/lib/models";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Verify signature
  const isValid = await verifyWebhookSignature(headers, rawBody);
  if (!isValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event_type as string;

  switch (eventType) {
    case "PAYMENT.CAPTURE.COMPLETED": {
      const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        await prisma.order.updateMany({
          where: { paypalTransactionId: paypalOrderId },
          data: { paypalStatus: "COMPLETED" },
        });
      }
      break;
    }

    case "PAYMENT.CAPTURE.DENIED": {
      const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        await prisma.order.updateMany({
          where: { paypalTransactionId: paypalOrderId },
          data: {
            paypalStatus: "DENIED",
            status: "CANCELLED",
            failureReason: "Payment capture denied by PayPal",
          },
        });
      }
      break;
    }

    case "PAYMENT.CAPTURE.REFUNDED": {
      const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        await prisma.order.updateMany({
          where: { paypalTransactionId: paypalOrderId },
          data: { paypalStatus: "REFUNDED", status: "REFUNDED" },
        });
      }
      break;
    }

    default:
      // Log unhandled event types for debugging
      console.log(`Unhandled PayPal webhook event: ${eventType}`);
  }

  // Always return 200 so PayPal doesn't retry
  return Response.json({ received: true });
}
