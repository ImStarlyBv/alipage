import { createHmac } from "crypto";

/**
 * HMAC-SHA256 signature for AliExpress IOP protocol.
 *
 * @param params - Key-value pairs to sign (excluding "sign" key)
 * @param secret - App secret
 * @param apiPath - Prepended to sign string for auth endpoints (e.g. "/auth/token/create")
 */
export function iopSign(
  params: Record<string, string>,
  secret: string,
  apiPath = ""
): string {
  const sorted = Object.keys(params)
    .sort()
    .filter((k) => params[k]);

  const concatenated =
    apiPath + sorted.map((k) => `${k}${params[k]}`).join("");

  return createHmac("sha256", secret)
    .update(concatenated, "utf-8")
    .digest("hex")
    .toUpperCase();
}
