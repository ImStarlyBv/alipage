import { describe, it, expect } from "vitest";
import {
  buildProductSlugMap as buildFromTs,
  slugifyTitle as slugifyTs,
} from "../../utils/product-slugs";
import {
  buildProductSlugMap as buildFromScript,
  slugifyTitle as slugifyScript,
} from "../../../../scripts/lib/product-slug.js";

// The CommonJS port exists because the deploy-time backfill runs from the
// standalone runner image, which has no loose `src/lib/**` files to import. Two
// copies of the algorithm is a real drift risk, and drift here means product
// URLs change on deploy — so both are pinned against each other and against the
// titles that are actually live.

/** Every product title in production, from the legacy review import. */
const LIVE_TITLES = [
  "Festive Knit Cat Costume Sweater",
  "Cherry Blossom Cotton Cat Tee",
  "Cotton Four-Leg Kitten Pajamas",
  "Nightfall Fleece Cat Pajama Pullover",
  "Cosplay Cat Costume Outfit",
  "Pocket Fleece Turtleneck Cat Jumpsuit",
  "Brushed Fleece Turtleneck Cat Pullover",
  "Everyday Fleece Cat Turtleneck",
  "Four-Leg Fleece Cat Hoodie",
  "Snug Winter Four-Leg Cat Hoodie",
  "Arctic Fleece-Lined Cat Hoodie Jacket",
  "Lounge Four-Leg Cat Sweatshirt Hoodie",
  "Hooded Fleece Cat Pajama Jumpsuit",
  "Dreamtime Hooded Cat Onesie",
  "Cartoon Cotton Cat Onesie",
  "Cotton Recovery Suit for Hairless Cats",
  "Breton Stripe Cotton Cat Vest Tee",
  "Soft Cotton Short-Sleeve Cat Tee",
  "Graphic Print Cotton Cat Tee",
  "Gentleman Cat Dress Shirt & Tie",
  "Heritage Fleece Turtleneck Cat Coat",
  "Classic Knit Sweater for Hairless Cats",
];

/** Shapes that break naive slugifiers, plus the duplicate case. */
const ADVERSARIAL_TITLES = [
  "Sphynx Café Sweater", // NFKD-decomposable accent
  "Naïve Zürich Pullover", // accents stripped, not transliterated
  "Café  Crème   Brûlée", // runs of whitespace
  "Sphynx! Cat? Clothes... 2026", // punctuation runs
  "Coat — Winter Edition", // em dash
  "  Leading and trailing  ", // edge whitespace
  "---Dasher---", // dashes at both edges
  "¿Qué? ¡Sí!", // inverted punctuation
  "Sphynx 猫 Sweater", // CJK drops out entirely
  "Hoodie 🧶 Warm", // emoji (astral plane, surrogate pair)
  "</script><script>alert(1)</script>", // the JSON-LD breakout string
  "&", // punctuation only — collapses to the fallback
  "!!!", // punctuation only — collapses to the fallback
  "", // empty — collapses to the fallback
  "الأزياء", // RTL script drops out entirely
  "UPPER CASE TITLE", // lowercase normalisation
  "Duplicate Title", // start of a deliberate duplicate trio
  "Duplicate Title",
  "Duplicate Title",
  "Duplicate Title", // 4th, to check `-4`
];

describe("slugifyTitle — script port vs. TypeScript original", () => {
  it.each([...LIVE_TITLES, ...ADVERSARIAL_TITLES])(
    "agrees on %j",
    (title) => {
      expect(slugifyScript(title)).toBe(slugifyTs(title));
    }
  );
});

describe("buildProductSlugMap — script port vs. TypeScript original", () => {
  it("agrees across the live catalog", () => {
    const products = LIVE_TITLES.map((title, index) => ({
      id: `p${index}`,
      title,
    }));

    expect(buildFromScript(products)).toEqual(buildFromTs(products));
  });

  it("agrees across adversarial and duplicate titles", () => {
    const products = ADVERSARIAL_TITLES.map((title, index) => ({
      id: `a${index}`,
      title,
    }));

    expect(buildFromScript(products)).toEqual(buildFromTs(products));
  });
});

describe("live catalog safety", () => {
  it("gives every live product a distinct slug", () => {
    // The backfill runs over `active: true` ordered by `createdAt asc, id asc`.
    // No two live titles collide, so every product keeps the bare slug — no
    // `-2` suffix appears and no currently-served URL changes.
    const products = LIVE_TITLES.map((title, index) => ({
      id: `p${index}`,
      title,
    }));
    const slugs = [...buildFromTs(products).values()];

    expect(new Set(slugs).size).toBe(LIVE_TITLES.length);
  });

  it("anchors a few known-live URLs", () => {
    expect(slugifyTs("Festive Knit Cat Costume Sweater")).toBe(
      "festive-knit-cat-costume-sweater"
    );
    expect(slugifyTs("Gentleman Cat Dress Shirt & Tie")).toBe(
      "gentleman-cat-dress-shirt-tie"
    );
  });

  it("resolves duplicates oldest-first, so the earliest product keeps the bare slug", () => {
    const products = [
      { id: "old", title: "Duplicate Title" },
      { id: "new", title: "Duplicate Title" },
      { id: "newer", title: "Duplicate Title" },
    ];
    const slugMap = buildFromTs(products);

    expect(slugMap.get("old")).toBe("duplicate-title");
    expect(slugMap.get("new")).toBe("duplicate-title-2");
    expect(slugMap.get("newer")).toBe("duplicate-title-3");
  });
});
