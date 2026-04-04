// POST /api/checkout/refund — Refund a captured payment (admin only)
import { prisma } from "@/lib/models";
import { refundCapture } from "@/lib/services/paypal/refunds";
import { requireAdmin } from "@/lib/auth/session";
import { validateBody, refundSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/api-error";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await validateBody(request, refundSchema);
  if (error) return error;

  const { orderId, amount } = data;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Extract capture ID from the raw PayPal response
    const rawResponse = order.paypalRawResponse as {
      purchase_units?: Array<{
        payments?: {
          captures?: Array<{ id: string }>;
        };
      }>;
    };
    const captureId =
      rawResponse?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (!captureId) {
      return Response.json(
        { error: "No capture found for this order" },
        { status: 400 }
      );
    }

    const refundResult = await refundCapture(captureId, amount?.toString());

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REFUNDED",
        paypalStatus: "REFUNDED",
      },
    });

    return Response.json({ refund: refundResult });
  } catch (err) {
    return handleApiError(err, "POST /api/checkout/refund");
  }
}
