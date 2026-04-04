// POST /api/checkout/create — Create PayPal order from cart (server-side)
import { prisma } from "@/lib/models";
import { createPayPalOrder, type CartItem } from "@/lib/services/paypal/orders";
import { requireAuth } from "@/lib/auth/session";

export async function POST() {
  const user = await requireAuth();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({ where: { customerId: user.id } });
  if (!cart) {
    return Response.json({ error: "Cart not found" }, { status: 404 });
  }

  const cartItems = cart.items as Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: string;
  }>;

  if (cartItems.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Validate stock for all items
  for (const item of cartItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId, active: true },
      select: { stock: true, salePrice: true, title: true },
    });

    if (!product) {
      return Response.json(
        { error: `Product "${item.name}" is no longer available` },
        { status: 400 }
      );
    }

    if (product.stock < item.quantity) {
      return Response.json(
        { error: `Insufficient stock for "${item.name}"` },
        { status: 400 }
      );
    }

    // Use current server-side price (not what the client sent)
    item.unitPrice = product.salePrice.toString();
    item.name = product.title;
  }

  // Create PayPal order with server-calculated prices
  const paypalItems: CartItem[] = cartItems.map((i) => ({
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));

  try {
    const paypalOrder = await createPayPalOrder(paypalItems);

    return Response.json({ paypalOrderId: paypalOrder.id });
  } catch (err) {
    console.error("PayPal order creation failed:", err);
    return Response.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
