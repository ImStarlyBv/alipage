import { describe, it, expect } from "vitest";
import {
  findFreeSlug as findFreeSlugTs,
  slugifyTitle as slugifyTs,
} from "../../utils/product-slugs";
import {
  findFreeSlug as findFreeSlugScript,
  slugifyTitle as slugifyScript,
} from "../../../../scripts/lib/product-slug.js";

// The CommonJS mirror exists because the deploy-time backfill runs from the
// standalone runner image, which has no loose `src/lib/**` files to import. Two
// copies of the algorithm is a real drift risk, and drift here means a product
// created through the admin import lands on a different URL than the backfill
// would have given it — so both are pinned against each other and against the
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

/**
 * What the backfill does to a set of titles, in the order it receives them:
 * slugify each, take the first free candidate, and remember it.
 */
function assignInOrder(titles: string[], findFreeSlug: typeof findFreeSlugTs) {
  const taken = new Set<string>();
  const slugs: string[] = [];

  for (const title of titles) {
    const slug = findFreeSlug(slugifyTs(title), taken);
    taken.add(slug);
    slugs.push(slug);
  }

  return slugs;
}

/** `taken` sets that exercise each branch of the suffix search. */
const TAKEN_CASES: [string, string[]][] = [
  ["empty", []],
  ["bare slug taken", ["fleece-hoodie"]],
  ["one suffix taken", ["fleece-hoodie", "fleece-hoodie-2"]],
  ["a gap before the suffix", ["fleece-hoodie-2", "fleece-hoodie-3"]],
  [
    "a deep run",
    ["fleece-hoodie", "fleece-hoodie-2", "fleece-hoodie-3", "fleece-hoodie-4"],
  ],
  ["only a near-miss is taken", ["fleece-hoodie-extra", "fleece-hoodies"]],
];

describe("slugifyTitle — script mirror vs. TypeScript", () => {
  it.each([...LIVE_TITLES, ...ADVERSARIAL_TITLES])(
    "agrees on %j",
    (title) => {
      expect(slugifyScript(title)).toBe(slugifyTs(title));
    }
  );
});

describe("findFreeSlug — script mirror vs. TypeScript", () => {
  it.each(TAKEN_CASES)("agrees with %s taken", (_label, taken) => {
    const base = slugifyTs("Fleece Hoodie");

    expect(findFreeSlugScript(base, new Set(taken))).toBe(
      findFreeSlugTs(base, new Set(taken))
    );
  });

  it("agrees across adversarial titles assigned in sequence", () => {
    expect(assignInOrder(ADVERSARIAL_TITLES, findFreeSlugScript)).toEqual(
      assignInOrder(ADVERSARIAL_TITLES, findFreeSlugTs)
    );
  });
});

describe("live catalog safety", () => {
  it("gives every live product a bare slug — no URL changes on backfill", () => {
    // The backfill walks `active: true` ordered by `createdAt asc, id asc`. No
    // two live titles collide, so every product keeps the un-suffixed slug and
    // no currently-served URL moves.
    const slugs = assignInOrder(LIVE_TITLES, findFreeSlugTs);

    expect(new Set(slugs).size).toBe(LIVE_TITLES.length);
    expect(slugs.some((slug) => /-\d+$/.test(slug))).toBe(false);
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
    const slugs = assignInOrder(
      ["Duplicate Title", "Duplicate Title", "Duplicate Title"],
      findFreeSlugTs
    );

    expect(slugs).toEqual([
      "duplicate-title",
      "duplicate-title-2",
      "duplicate-title-3",
    ]);
  });

  it("skips past a suffix already held by another product", () => {
    // The admin import asks the same question against the slugs already in the
    // table, so a title whose `-2` is taken must land on `-3`.
    expect(
      findFreeSlugTs(
        "duplicate-title",
        new Set(["duplicate-title", "duplicate-title-2"])
      )
    ).toBe("duplicate-title-3");
  });
});
