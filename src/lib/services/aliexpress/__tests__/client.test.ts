import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth module before importing client
vi.mock("../auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue("fake-token-123"),
}));

import { apiCall } from "../client";

describe("apiCall", () => {
  beforeEach(() => {
    vi.stubEnv("ALIEXPRESS_APP_KEY", "520610");
    vi.stubEnv("ALIEXPRESS_APP_SECRET", "EkVXVYRJGSTgh5sf8ImobLRa3u9A9Aph");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ result: "ok" }),
      })
    );
  });

  it("throws if env vars are missing", async () => {
    vi.stubEnv("ALIEXPRESS_APP_KEY", "");
    await expect(apiCall("test.method")).rejects.toThrow("Missing");
  });

  it("sends POST to AliExpress gateway", async () => {
    await apiCall("aliexpress.ds.category.get");

    expect(fetch).toHaveBeenCalledWith(
      "https://api-sg.aliexpress.com/sync",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("includes required IOP params", async () => {
    await apiCall("aliexpress.ds.category.get");

    const call = vi.mocked(fetch).mock.calls[0];
    const body = call[1]!.body as string;
    expect(body).toContain("app_key=520610");
    expect(body).toContain("method=aliexpress.ds.category.get");
    expect(body).toContain("sign_method=sha256");
    expect(body).toContain("v=2.0");
    expect(body).toContain("sign=");
  });

  it("includes session token when needAuth is true", async () => {
    await apiCall("aliexpress.ds.category.get", {}, true);

    const call = vi.mocked(fetch).mock.calls[0];
    const body = call[1]!.body as string;
    expect(body).toContain("session=fake-token-123");
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
    );

    await expect(apiCall("test.method")).rejects.toThrow("HTTP 500");
  });
});
