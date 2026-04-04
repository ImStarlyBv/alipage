/**
 * CSRF protection for JSON API routes.
 * Verifies that the request has a JSON content-type header,
 * which prevents simple cross-origin form submissions.
 * Combined with SameSite cookies (NextAuth default), this provides CSRF protection.
 */
export function checkCsrf(request: Request): Response | null {
  const contentType = request.headers.get("content-type");

  // Only check mutation methods
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return null;
  }

  // Webhooks use different content types
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/webhooks") || url.pathname.startsWith("/api/cron")) {
    return null;
  }

  if (!contentType || !contentType.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json" },
      { status: 415 }
    );
  }

  return null;
}
