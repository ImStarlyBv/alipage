import { describe, it, expect } from "vitest";
import sitemap from "../sitemap";
import { COLLECTION_SLUGS } from "@/lib/collections";

const SITE_URL = "https://kittycontrol.shop";

describe("sitemap lists exactly the pages that should be indexed", () => {
  it("carries the home page, /products and every collection, and no /categories", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain(SITE_URL);
    expect(urls).toContain(`${SITE_URL}/products`);
    for (const slug of COLLECTION_SLUGS) {
      expect(urls).toContain(`${SITE_URL}/${slug}`);
    }

    // /categories was retired (308 to /products) — it must never reappear here,
    // or Google keeps a dead end in its crawl queue.
    expect(urls).not.toContain(`${SITE_URL}/categories`);
  });

  it("lists no URL twice", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(new Set(urls).size).toBe(urls.length);
  });
});
