// PUT    /api/cart/[itemId] — Update item quantity
// DELETE /api/cart/[itemId] — Remove item from cart
import { prisma } from "@/lib/models";
import { requireAuth } from "@/lib/auth/session";
import { validateBody, updateCartItemSchema } from "@/lib/utils/validation";
import type { NextRequest } from "next/server";

type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  unitPrice: string;
  image: string;
};

async function getCart() {
  const user = await requireAuth();
  if (!user) return null;
  return prisma.cart.findUnique({ where: { customerId: user.id } });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await ctx.params;
  const { data, error } = await validateBody(req, updateCartItemSchema);
  if (error) return error;
  const { quantity } = data;

  const cart = await getCart();
  if (!cart) {
    return Response.json({ error: "Cart not found" }, { status: 404 });
  }

  const items = cart.items as CartItem[];
  const index = items.findIndex((i) => i.productId === itemId);

  if (index < 0) {
    return Response.json({ error: "Item not in cart" }, { status: 404 });
  }

  items[index].quantity = quantity;

  await prisma.cart.update({
    where: { id: cart.id },
    data: { items },
  });

  return Response.json({ items });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await ctx.params;

  const cart = await getCart();
  if (!cart) {
    return Response.json({ error: "Cart not found" }, { status: 404 });
  }

  const items = cart.items as CartItem[];
  const filtered = items.filter((i) => i.productId !== itemId);

  await prisma.cart.update({
    where: { id: cart.id },
    data: { items: filtered },
  });

  return Response.json({ items: filtered });
}
