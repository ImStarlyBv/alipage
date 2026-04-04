// Simple in-memory rate limiter for Route Handlers.
// For production with multiple instances, replace with Redis-based limiter.

const hits = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of hits) {
    if (now > value.resetAt) hits.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  /** Max requests in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/**
 * Check rate limit for a given key (e.g., IP address).
 * Returns { success: true } if within limit, { success: false, retryAfter } if exceeded.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { success: true } | { success: false; retryAfter: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { success: true };
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, retryAfter };
  }

  entry.count++;
  return { success: true };
}

/**
 * Get client IP from request headers (works behind reverse proxy).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Apply rate limiting to a request. Returns a Response if rate limited, null if OK.
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig = { limit: 60, windowSeconds: 60 }
): Response | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, config);

  if (!result.success) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfter) },
      }
    );
  }

  return null;
}
