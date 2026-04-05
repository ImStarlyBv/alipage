import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

// ─── Cart ────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100),
});

// ─── Checkout ────────────────────────────────────────────

export const captureCheckoutSchema = z.object({
  paypalOrderId: z.string().min(1, "paypalOrderId is required"),
  shippingAddress: z.object({
    full_name: z.string().min(1),
    phone_country: z.string().min(1),
    mobile_no: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    province: z.string().min(1),
    country: z.string().min(2).max(3),
    zip: z.string().min(1),
  }),
});

export const refundSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
  amount: z.number().positive().optional(),
});

// ─── Admin ───────────────────────────────────────────────

export const importProductSchema = z.object({
  aliexpressId: z.union([z.string().min(1), z.number()]),
  markup: z.number().min(1).max(10).optional().default(1.5),
});

export const updateProductSchema = z.object({
  salePrice: z.number().positive("Price must be positive").optional(),
  markup: z.number().min(1).max(10).optional(),
  active: z.boolean().optional(),
});

export const completeManualSchema = z.object({
  aliexpressOrderId: z.string().optional(),
  trackingNumber: z.string().optional(),
});

// ─── Helper ──────────────────────────────────────────────

/**
 * Parse and validate request body against a Zod schema.
 * Returns { data, error }. If error is set, return it as the response.
 */
export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      data: null,
      error: Response.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message);
    return {
      data: null,
      error: Response.json(
        { error: "Validation failed", details: messages },
        { status: 400 }
      ),
    };
  }

  return { data: result.data, error: null };
}
