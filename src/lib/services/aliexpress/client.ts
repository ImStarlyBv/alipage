// AliExpress IOP API Client - Server Side Only
// Gateway: https://api-sg.aliexpress.com/sync
// Sign method: HMAC-SHA256

import { iopSign } from "./sign";
import { getAccessToken } from "./auth";

const API_URL = "https://api-sg.aliexpress.com/sync";

export interface AliExpressResponse {
  [key: string]: unknown;
}

/**
 * Core IOP protocol API call to AliExpress.
 * All params go as form-urlencoded POST body.
 * Timestamp in milliseconds, sign method sha256.
 */
export async function apiCall(
  method: string,
  params: Record<string, string> = {},
  needAuth = false
): Promise<AliExpressResponse> {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;

  if (!appKey || !appSecret) {
    throw new Error(
      "Missing ALIEXPRESS_APP_KEY or ALIEXPRESS_APP_SECRET env vars"
    );
  }

  const allParams: Record<string, string> = {
    app_key: appKey,
    method,
    sign_method: "sha256",
    timestamp: String(Date.now()),
    v: "2.0",
    format: "json",
    ...params,
  };

  if (needAuth) {
    const token = await getAccessToken();
    if (!token) {
      throw new Error(
        "No AliExpress access token available. Check env vars or refresh token."
      );
    }
    allParams.session = token;
  }

  allParams.sign = iopSign(allParams, appSecret);

  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams(allParams).toString(),
    signal: AbortSignal.timeout(30_000),
  });

  if (!resp.ok) {
    throw new Error(`AliExpress API HTTP ${resp.status}: ${resp.statusText}`);
  }

  return resp.json();
}
