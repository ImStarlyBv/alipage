import { describe, it, expect } from "vitest";
import {
  COLLECTIONS,
  COLLECTION_SLUGS,
  collectionProductSlugs,
  collectionStaticParams,
  getCollection,
  type Collection,
} from "../collections";

/**
 * The 22 products live in production today.
 *
 * This is the same catalogue snapshot pinned in
 * `src/lib/seo/__tests__/product-slug-parity.test.ts:28-51`, which is the file
 * that fails when a live URL moves. It is repeated here rather than imported
 * because that test's table is deliberately not exported — and because two
 * independent pins that have to agree is the point: if the catalogue changes,
 * both fail, and the fix is a deliberate edit in each.
 */
const LIVE_PRODUCT_SLUGS: readonly string[] = [
  "sphynx-cat-christmas-sweater-festive-knit",
  "sphynx-cat-shirt-cherry-blossom-cotton-tee",
  "sphynx-cat-pajamas-cotton-four-leg-onesie",
  "sphynx-cat-pajamas-nightfall-fleece-pullover",
  "sphynx-cat-costume-cosplay-outfit",
  "sphynx-cat-jumpsuit-pocket-fleece-turtleneck",
  "sphynx-cat-turtleneck-brushed-fleece-pullover",
  "sphynx-cat-turtleneck-everyday-fleece",
  "sphynx-cat-hoodie-four-leg-fleece",
  "sphynx-cat-hoodie-snug-winter-four-leg",
  "sphynx-cat-jacket-arctic-fleece-lined-hoodie",
  "sphynx-cat-sweatshirt-lounge-four-leg-hoodie",
  "sphynx-cat-jumpsuit-hooded-fleece-pajama",
  "sphynx-cat-onesie-dreamtime-hooded",
  "sphynx-cat-onesie-cartoon-cotton",
  "sphynx-cat-recovery-suit-soft-cotton",
  "sphynx-cat-vest-tee-breton-stripe-cotton",
  "sphynx-cat-t-shirt-soft-cotton-short-sleeve",
  "sphynx-cat-t-shirt-graphic-print-cotton",
  "sphynx-cat-shirt-gentleman-dress-shirt-tie",
  "sphynx-cat-coat-heritage-fleece-turtleneck",
  "sphynx-cat-sweater-classic-knit",
];

/**
 * The products no Phase 1 collection covers.
 *
 * These are not forgotten: Phase 2 adds `/sphynx-cat-shirts`,
 * `/sphynx-cat-pajamas` and `/cat-recovery-suits`, which absorb all of them.
 * Pinned so that shrinking this list has to be a decision, not a side effect.
 *
 * `sphynx-cat-vest-tee-breton-stripe-cotton` is here despite the name. The live
 * product page describes it as a lightweight cotton sleeveless layer for warm
 * days — not a knit, and not a warm layer — so it does not belong in sweaters.
 */
const ORPHAN_SLUGS: readonly string[] = [
  "sphynx-cat-t-shirt-soft-cotton-short-sleeve",
  "sphynx-cat-t-shirt-graphic-print-cotton",
  "sphynx-cat-vest-tee-breton-stripe-cotton",
  "sphynx-cat-shirt-gentleman-dress-shirt-tie",
  "sphynx-cat-shirt-cherry-blossom-cotton-tee",
  "sphynx-cat-pajamas-cotton-four-leg-onesie",
  "sphynx-cat-onesie-cartoon-cotton",
  "sphynx-cat-onesie-dreamtime-hooded",
  "sphynx-cat-recovery-suit-soft-cotton",
];

/** Mirrors the `template` in `src/app/layout.tsx`. */
const TITLE_SUFFIX = " | Kitty Control";

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function longCopyWords(collection: Collection): number {
  return words(
    [...collection.body, ...collection.sizingTips, ...collection.careNotes].join(" ")
  );
}

describe("every collection is a page worth indexing", () => {
  it.each(COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s has a title that fits a SERP once the layout template is applied",
    (_slug, collection) => {
      // The template appends " | Kitty Control", so a title that is fine on its
      // own can still be truncated in the result. Guard the rendered length.
      expect(collection.title.length).toBeLessThanOrEqual(60);
      expect(`${collection.title}${TITLE_SUFFIX}`.length).toBeLessThanOrEqual(60);
      expect(collection.description.length).toBeLessThanOrEqual(160);
      expect(collection.description.length).toBeGreaterThan(70);
    }
  );

  it.each(COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s targets its keyword in the h1",
    (_slug, collection) => {
      // The h1 is the page's strongest on-page signal for the query it exists
      // to win, so a keyword the h1 does not contain is a page with no target.
      expect(collection.h1.toLowerCase()).toContain(
        collection.primaryKeyword.toLowerCase()
      );
    }
  );

  it.each(COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s answers the query in its lead paragraph, inside the 40-60 word budget",
    (_slug, collection) => {
      // The budget exists so an answer engine can lift the paragraph whole.
      // Under 40 words it is too thin to be cited; over 60 it gets truncated.
      const count = words(collection.answer);
      expect(count).toBeGreaterThanOrEqual(40);
      expect(count).toBeLessThanOrEqual(60);
    }
  );

  it.each(COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s carries enough copy to not read as thin, inside the 300-600 word budget",
    (_slug, collection) => {
      const count = longCopyWords(collection);
      expect(count).toBeGreaterThanOrEqual(300);
      expect(count).toBeLessThanOrEqual(600);
    }
  );

  it.each(COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s carries 3-5 FAQs, which feed both the accordion and FAQPage",
    (_slug, collection) => {
      expect(collection.faqs.length).toBeGreaterThanOrEqual(3);
      expect(collection.faqs.length).toBeLessThanOrEqual(5);
      for (const faq of collection.faqs) {
        expect(faq.question.trim().length).toBeGreaterThan(0);
        expect(faq.answer.trim().length).toBeGreaterThan(40);
      }
    }
  );

  it.each(COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s has an informative fabric comparison, not a decorative one",
    (_slug, collection) => {
      expect(collection.fabricTable.caption.trim().length).toBeGreaterThan(0);
      expect(collection.fabricTable.rows.length).toBeGreaterThanOrEqual(3);
      for (const row of collection.fabricTable.rows) {
        for (const field of [
          row.fabric,
          row.warmth,
          row.breathability,
          row.bestFor,
          row.watchOut,
        ]) {
          expect(field.trim().length).toBeGreaterThan(0);
        }
      }
    }
  );

  it.each(COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s is not dated in the future, so the sitemap cannot claim a lie",
    (_slug, collection) => {
      const parsed = Date.parse(collection.updatedAt);
      expect(Number.isNaN(parsed)).toBe(false);
      expect(parsed).toBeLessThanOrEqual(Date.now());
    }
  );
});

describe("the roster holds together", () => {
  it("keeps every collection slug a clean, unique URL segment", () => {
    // A slug with a capital, a space or a slash would 404 or collide with the
    // static routes sitting at the same level.
    for (const slug of COLLECTION_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
    expect(new Set(COLLECTION_SLUGS).size).toBe(COLLECTION_SLUGS.length);
  });

  it("lists no product twice inside one collection", () => {
    // A duplicate renders the same card twice and double-counts ItemList, which
    // makes `numberOfItems` disagree with the grid a crawler sees.
    for (const collection of COLLECTIONS) {
      expect(new Set(collection.productSlugs).size).toBe(
        collection.productSlugs.length
      );
    }
  });

  it("puts at least one product on every collection page", () => {
    for (const collection of COLLECTIONS) {
      expect(collection.productSlugs.length).toBeGreaterThan(0);
    }
  });

  it("keeps related guides empty until the /guides hub ships", () => {
    // A collection page linking to a guide that does not exist is a dead link
    // from every crawl path, which is worse than no link at all.
    for (const collection of COLLECTIONS) {
      expect(collection.relatedGuides).toEqual([]);
    }
  });

  it("only cross-links to another collection that exists", () => {
    for (const collection of COLLECTIONS) {
      if (!collection.crossLink) continue;
      expect(COLLECTION_SLUGS).toContain(
        collection.crossLink.href.replace(/^\//, "")
      );
    }
  });

  it("resolves a known slug and refuses an unknown one", () => {
    expect(getCollection("sphynx-cat-sweaters")?.slug).toBe("sphynx-cat-sweaters");
    expect(getCollection("sphynx-cat-hats")).toBeUndefined();
  });

  it("hands the router exactly the roster as static params", () => {
    // With `dynamicParams = false`, this array is the complete set of URLs that
    // render. Anything missing here is a 404 even though the config has it.
    expect(collectionStaticParams()).toEqual(
      COLLECTION_SLUGS.map((collection) => ({ collection }))
    );
  });
});

describe("membership matches the live catalogue", () => {
  it("references only products that exist, so no grid card 404s", () => {
    // This is the test that fires when a product slug is edited and a
    // collection is left pointing at the old one. Renaming a slug silently
    // drops the product from every collection otherwise.
    const unknown = collectionProductSlugs().filter(
      (slug) => !LIVE_PRODUCT_SLUGS.includes(slug)
    );
    expect(unknown).toEqual([]);
  });

  it("leaves exactly the known products out, with nothing lost between them", () => {
    // Every live product is either in a collection or on the pinned orphan
    // list. A product in neither has been dropped by accident.
    const inCollection = collectionProductSlugs();
    const accounted = new Set([...inCollection, ...ORPHAN_SLUGS]);

    expect([...accounted].sort()).toEqual([...LIVE_PRODUCT_SLUGS].sort());
    expect(inCollection.filter((slug) => ORPHAN_SLUGS.includes(slug))).toEqual([]);
  });

  it("places multi-collection products only where both claims are true", () => {
    // A four-leg fleece hoodie is genuinely a hoodie and winter clothing, so it
    // belongs in both. This pins the intended overlap rather than the count.
    const winter = getCollection("sphynx-cat-winter-clothes")!;
    const hoodies = getCollection("sphynx-cat-hoodies")!;
    const sweaters = getCollection("sphynx-cat-sweaters")!;

    expect(hoodies.productSlugs).toContain("sphynx-cat-hoodie-four-leg-fleece");
    expect(winter.productSlugs).toContain("sphynx-cat-hoodie-four-leg-fleece");
    expect(sweaters.productSlugs).toContain("sphynx-cat-sweater-classic-knit");
    expect(winter.productSlugs).toContain("sphynx-cat-sweater-classic-knit");
  });

  it("keeps the summer-weight vest tee out of the sweater collection", () => {
    // Named because the slug says "vest tee" and the collection says "sweaters",
    // which is exactly the kind of match that gets made by pattern rather than
    // by reading the product.
    const sweaters = getCollection("sphynx-cat-sweaters")!;
    expect(sweaters.productSlugs).not.toContain(
      "sphynx-cat-vest-tee-breton-stripe-cotton"
    );
  });
});
