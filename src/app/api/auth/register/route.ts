// POST /api/auth/register — Create new customer account
import { prisma } from "@/lib/models";
import { hash } from "bcryptjs";
import { rateLimit } from "@/lib/utils/rate-limit";
import { validateBody, registerSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/api-error";

export async function POST(request: Request) {
  // Rate limit: 5 registrations per minute per IP
  const limited = rateLimit(request, { limit: 5, windowSeconds: 60 });
  if (limited) return limited;

  const { data, error } = await validateBody(request, registerSchema);
  if (error) return error;

  const { email, name, password } = data;

  try {

  const existing = await prisma.customer.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return Response.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);

  const customer = await prisma.customer.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true },
  });

  return Response.json(customer, { status: 201 });
  } catch (err) {
    return handleApiError(err, "POST /api/auth/register");
  }
}
