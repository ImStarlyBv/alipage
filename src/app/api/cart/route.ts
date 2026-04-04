// POST /api/cart — Add item to cart
// GET  /api/cart — Get current cart
import { prisma } from "@/lib/models";
import { requireAuth } from "@/lib/auth/session";

async function getOrCreateCart() {
  const user = await requireAuth();
  if (!user) return null;

  const existing = await prisma.cart.findUnique({
    where: { customerId: user.id },
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { customerId: user.id, items: [] },
  });
}

export async function GET() {
  const cart = await getOrCreateCart();
  if (!cart) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ items: cart.items });
}

interface AddItemBody {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function POST(request: Request) {
  const body: AddItemBody = await request.json();

  if (!body.productId || !body.quantity || body.quantity < 1) {
    return Response.json(
      { error: "productId and quantity (>= 1) are required" },
      { status: 400 }
    );
  }

  // Verify product exists and is active
  const product = await prisma.product.findUnique({
    where: { id: body.productId, active: true },
    select: { id: true, title: true, salePrice: true, images: true, stock: true },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.stock < body.quantity) {
    return Response.json({ error: "Insufficient stock" }, { status: 400 });
  }

  const cart = await getOrCreateCart();
  if (!cart) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = cart.items as Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    name: string;
    unitPrice: string;
    image: string;
  }>;

  // Check if item already in cart
  const existingIndex = items.findIndex(
    (i) => i.productId === body.productId && i.variantId === (body.variantId || undefined)
  );

  if (existingIndex >= 0) {
    items[existingIndex].quantity += body.quantity;
  } else {
    const images = product.images as string[];
    items.push({
      productId: product.id,
      variantId: body.variantId,
      quantity: body.quantity,
      name: product.title,
      unitPrice: product.salePrice.toString(),
      image: images[0] || "",
    });
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { items },
  });

  return Response.json({ items });
}
