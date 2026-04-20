import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes require ADMIN role
    if (pathname.startsWith("/api/admin") || pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public API routes that don't require auth
        if (
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/api/categories") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/webhooks")
        ) {
          return true;
        }

        // All other matched routes require a valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/api/cart/:path*",
    "/api/checkout/:path*",
    "/api/orders/:path*",
    "/api/admin/orders/:path*",
    "/api/admin/products/sync",
    "/admin/:path*",
    "/account/:path*",
  ],
};
