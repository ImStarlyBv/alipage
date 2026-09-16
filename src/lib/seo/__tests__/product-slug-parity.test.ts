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

/**
 * Every product in production, as `[title the page renders, URL it is served
 * at]`, read from the live catalog on 2026-09-16.
 *
 * The backfill derives each product's slug from its title at deploy time, so
 * this table IS the blast radius: every pair must stay equal or a live URL
 * moves. These are not the titles the products were imported with — the copy
 * has been rewritten twice since, and each rewrite moved every URL. The URLs
 * below are the ones that exist now, and the ones the backfill must freeze.
 */
const LIVE_PRODUCTS: [title: string, url: string][] = [
  ["Sphynx Cat Christmas Sweater — Festive Knit", "sphynx-cat-christmas-sweater-festive-knit"],
  ["Sphynx Cat Shirt — Cherry Blossom Cotton Tee", "sphynx-cat-shirt-cherry-blossom-cotton-tee"],
  ["Sphynx Cat Pajamas — Cotton Four-Leg Onesie", "sphynx-cat-pajamas-cotton-four-leg-onesie"],
  ["Sphynx Cat Pajamas — Nightfall Fleece Pullover", "sphynx-cat-pajamas-nightfall-fleece-pullover"],
  ["Sphynx Cat Costume — Cosplay Outfit", "sphynx-cat-costume-cosplay-outfit"],
  ["Sphynx Cat Jumpsuit — Pocket Fleece Turtleneck", "sphynx-cat-jumpsuit-pocket-fleece-turtleneck"],
  ["Sphynx Cat Turtleneck — Brushed Fleece Pullover", "sphynx-cat-turtleneck-brushed-fleece-pullover"],
  ["Sphynx Cat Turtleneck — Everyday Fleece", "sphynx-cat-turtleneck-everyday-fleece"],
  ["Sphynx Cat Hoodie — Four-Leg Fleece", "sphynx-cat-hoodie-four-leg-fleece"],
  ["Sphynx Cat Hoodie — Snug Winter Four-Leg", "sphynx-cat-hoodie-snug-winter-four-leg"],
  ["Sphynx Cat Jacket — Arctic Fleece-Lined Hoodie", "sphynx-cat-jacket-arctic-fleece-lined-hoodie"],
  ["Sphynx Cat Sweatshirt — Lounge Four-Leg Hoodie", "sphynx-cat-sweatshirt-lounge-four-leg-hoodie"],
  ["Sphynx Cat Jumpsuit — Hooded Fleece Pajama", "sphynx-cat-jumpsuit-hooded-fleece-pajama"],
  ["Sphynx Cat Onesie — Dreamtime Hooded", "sphynx-cat-onesie-dreamtime-hooded"],
  ["Sphynx Cat Onesie — Cartoon Cotton", "sphynx-cat-onesie-cartoon-cotton"],
  ["Sphynx Cat Recovery Suit — Soft Cotton", "sphynx-cat-recovery-suit-soft-cotton"],
  ["Sphynx Cat Vest Tee — Breton Stripe Cotton", "sphynx-cat-vest-tee-breton-stripe-cotton"],
  ["Sphynx Cat T-Shirt — Soft Cotton Short-Sleeve", "sphynx-cat-t-shirt-soft-cotton-short-sleeve"],
  ["Sphynx Cat T-Shirt — Graphic Print Cotton", "sphynx-cat-t-shirt-graphic-print-cotton"],
  ["Sphynx Cat Shirt — Gentleman Dress Shirt & Tie", "sphynx-cat-shirt-gentleman-dress-shirt-tie"],
  ["Sphynx Cat Coat — Heritage Fleece Turtleneck", "sphynx-cat-coat-heritage-fleece-turtleneck"],
  ["Sphynx Cat Sweater — Classic Knit", "sphynx-cat-sweater-classic-knit"],
];

const LIVE_TITLES = LIVE_PRODUCTS.map(([title]) => title);

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

  it("derives every live URL from the title that page currently renders", () => {
    // The whole safety claim of the backfill rests on this: it recomputes each
    // slug from the title at deploy time, so if the two disagree for even one
    // product, that product's live URL 404s the moment the new code serves.
    for (const [title, url] of LIVE_PRODUCTS) {
      expect(slugifyTs(title)).toBe(url);
    }
  });

  it("handles the em dash and ampersand the live titles actually use", () => {
    expect(slugifyTs("Sphynx Cat Sweater — Classic Knit")).toBe(
      "sphynx-cat-sweater-classic-knit"
    );
    expect(slugifyTs("Sphynx Cat Shirt — Gentleman Dress Shirt & Tie")).toBe(
      "sphynx-cat-shirt-gentleman-dress-shirt-tie"
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
