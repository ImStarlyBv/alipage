// POST /api/auth/register — Create new customer account
import { prisma } from "@/lib/models";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name, password } = body;

  if (!email || !name || !password) {
    return Response.json(
      { error: "email, name, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

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
}
