// POST /api/checkout/capture — Capture PayPal payment, save order, trigger AE order
import { prisma } from "@/lib/models";
import { capturePayPalOrder } from "@/lib/services/paypal/orders";
import { requireAuth } from "@/lib/auth/session";
import { placeAEOrder } from "@/lib/services/aliexpress/place-order";
import { sendOrderConfirmationEmail } from "@/lib/services/email/transactional";
import { rateLimit } from "@/lib/utils/rate-limit";
import { validateBody, captureCheckoutSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/api-error";
import type { ShippingAddress } from "@/lib/services/aliexpress/orders";

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 captures per minute per IP
  const limited = rateLimit(request, { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  const { data, error } = await validateBody(request, captureCheckoutSchema);
  if (error) return error;

  const { paypalOrderId, shippingAddress } = data as {
    paypalOrderId: string;
    shippingAddress: ShippingAddress;
  };

  try {

  // Get cart for order items
  const cart = await prisma.cart.findUnique({ where: { customerId: user.id } });

  if (!cart) {
    return Response.json({ error: "Cart not found" }, { status: 400 });
  }

  const cartItems = cart.items as Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: string;
    variantId?: string;
  }>;

  // Capture the PayPal payment
  let captureResult;
  try {
    captureResult = await capturePayPalOrder(paypalOrderId);
  } catch (err: unknown) {
    console.error("PayPal capture failed:", err);

    // Check for INSTRUMENT_DECLINED
    const errorBody =
      err && typeof err === "object" && "body" in err
        ? (err as { body: string }).body
        : null;
    if (errorBody && typeof errorBody === "string") {
      try {
        const parsed = JSON.parse(errorBody);
        if (
          parsed?.details?.some(
            (d: { issue?: string }) => d.issue === "INSTRUMENT_DECLINED"
          )
        ) {
          return Response.json(
            {
              error: "Payment method declined",
              code: "INSTRUMENT_DECLINED",
            },
            { status: 422 }
          );
        }
      } catch {
        // not JSON, ignore
      }
    }

    return Response.json(
      { error: "Payment capture failed" },
      { status: 500 }
    );
  }

  // Calculate total from server-side prices
  const totalPaid = cartItems.reduce(
    (sum, i) => sum + parseFloat(i.unitPrice) * i.quantity,
    0
  );

  // Save order in DB BEFORE calling AliExpress (rule #4: order always persists)
  const order = await prisma.order.create({
    data: {
      items: cartItems,
      shippingAddress: JSON.parse(JSON.stringify(shippingAddress)),
      totalPaid,
      currency: "USD",
      paypalTransactionId: paypalOrderId,
      paypalStatus: captureResult.status,
      paypalRawResponse: JSON.parse(JSON.stringify(captureResult)),
      status: "PAID",
      customerId: user.id,
    },
  });

  // Clear the cart after successful payment
  await prisma.cart.update({
    where: { id: cart.id },
    data: { items: [] },
  });

  // Send order confirmation email (non-blocking)
  sendOrderConfirmationEmail({
    to: user.email!,
    customerName: user.name || "Customer",
    orderNumber: order.orderNumber,
    orderId: order.id,
    items: cartItems.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: parseFloat(i.unitPrice) * i.quantity,
    })),
    totalPaid,
  }).catch((err) =>
    console.error(`Confirmation email failed for order ${order.id}:`, err)
  );

  // Attempt to create AliExpress order automatically (non-blocking for the response)
  // If it fails, admin can retry manually from the dashboard
  placeAEOrder(order.id, cartItems, shippingAddress).catch((err) => {
    console.error(`AE order creation failed for order ${order.id}:`, err);
  });

  return Response.json({ orderId: order.id });
  } catch (err) {
    return handleApiError(err, "POST /api/checkout/capture");
  }
}
