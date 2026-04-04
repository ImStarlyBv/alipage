/**
 * Log server-side errors and return a safe response (no stack traces to client).
 */
export function handleApiError(err: unknown, context: string): Response {
  const message = err instanceof Error ? err.message : "Unknown error";
  const stack = err instanceof Error ? err.stack : undefined;

  // Server-side only — never reaches the client
  console.error(`[API Error] ${context}:`, message);
  if (stack) console.error(stack);

  return Response.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
