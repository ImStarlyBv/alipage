import { readFile, writeFile } from "fs/promises";
import path from "path";
import { iopSign } from "./sign";

const TOKEN_FILE = path.join(process.cwd(), "ae_token.json");
const OAUTH_TOKEN_URL =
  "https://api-sg.aliexpress.com/rest/auth/token/create";
const OAUTH_REFRESH_URL =
  "https://api-sg.aliexpress.com/rest/auth/token/refresh";

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expire_time?: number;
  refresh_token_valid_time?: number;
  saved_at?: string;
  [key: string]: unknown;
}

let cachedToken: TokenData | null = null;

/**
 * Get a valid access token. Priority:
 * 1. Cached in-memory (if not expired)
 * 2. Token file on disk (auto-refresh if expired)
 * 3. Env var ALIEXPRESS_ACCESS_TOKEN as fallback
 */
export async function getAccessToken(): Promise<string | null> {
  if (cachedToken && !isExpired(cachedToken)) {
    return cachedToken.access_token;
  }

  const fileToken = await loadTokenFile();
  if (fileToken) {
    if (!isExpired(fileToken)) {
      cachedToken = fileToken;
      return fileToken.access_token;
    }
    if (fileToken.refresh_token && !isRefreshExpired(fileToken)) {
      const refreshed = await refreshToken(fileToken.refresh_token);
      if (refreshed) {
        cachedToken = refreshed;
        return refreshed.access_token;
      }
    }
  }

  const envToken = process.env.ALIEXPRESS_ACCESS_TOKEN;
  if (envToken) return envToken;

  return null;
}

function isExpired(token: TokenData): boolean {
  if (!token.expire_time) return false;
  return Date.now() > token.expire_time - 5 * 60 * 1000;
}

function isRefreshExpired(token: TokenData): boolean {
  if (!token.refresh_token_valid_time) return false;
  return Date.now() > token.refresh_token_valid_time - 5 * 60 * 1000;
}

async function loadTokenFile(): Promise<TokenData | null> {
  try {
    const raw = await readFile(TOKEN_FILE, "utf-8");
    return JSON.parse(raw) as TokenData;
  } catch {
    return null;
  }
}

async function saveTokenFile(data: TokenData): Promise<void> {
  data.saved_at = new Date().toISOString();
  await writeFile(TOKEN_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** Refresh access token. Sign path: /auth/token/refresh */
export async function refreshToken(
  refreshTokenStr: string
): Promise<TokenData | null> {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  if (!appKey || !appSecret) return null;

  const params: Record<string, string> = {
    app_key: appKey,
    timestamp: String(Date.now()),
    sign_method: "sha256",
    refresh_token: refreshTokenStr,
  };

  params.sign = iopSign(params, appSecret, "/auth/token/refresh");

  const resp = await fetch(OAUTH_REFRESH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(30_000),
  });

  const data = (await resp.json()) as TokenData;
  if (data.access_token) {
    await saveTokenFile(data);
    return data;
  }

  console.error("AliExpress token refresh failed:", data);
  return null;
}

/** Exchange OAuth authorization code for tokens. Sign path: /auth/token/create */
export async function exchangeCode(code: string): Promise<TokenData | null> {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  if (!appKey || !appSecret) return null;

  const params: Record<string, string> = {
    app_key: appKey,
    timestamp: String(Date.now()),
    sign_method: "sha256",
    code,
  };

  params.sign = iopSign(params, appSecret, "/auth/token/create");

  const resp = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(30_000),
  });

  const data = (await resp.json()) as TokenData;
  if (data.access_token) {
    cachedToken = data;
    await saveTokenFile(data);
    return data;
  }

  console.error("AliExpress token exchange failed:", data);
  return null;
}

/** Generate OAuth authorization URL for user to visit. */
export function getOAuthUrl(
  redirectUri = "https://www.my-temporary-store.com/callback"
): string {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  return (
    `https://api-sg.aliexpress.com/oauth/authorize` +
    `?response_type=code&force_auth=true` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&client_id=${appKey}`
  );
}
