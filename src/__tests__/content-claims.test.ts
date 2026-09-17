import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guards the claims we deliberately deleted from the homepage.
 *
 * These are source-text assertions rather than rendered-output ones because the
 * claim is about what the copy says, not about how it renders — and this suite
 * has no jsdom. A source guard is the honest tool here.
 *
 * The scan covers `src/app` and `src/components`. It deliberately does NOT cover
 * this directory, which would match its own fixtures.
 */
const SRC = fileURLToPath(new URL("..", import.meta.url));

function sourceFilesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFilesIn(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const sources = [
  ...sourceFilesIn(join(SRC, "app")),
  ...sourceFilesIn(join(SRC, "components")),
].map((file) => ({ file, text: readFileSync(file, "utf8").toLowerCase() }));

/** Files whose text contains `phrase`, so a failure names what to go and edit. */
function filesContaining(phrase: string) {
  return sources
    .filter(({ text }) => text.includes(phrase.toLowerCase()))
    .map(({ file }) => file.slice(SRC.length + 1));
}

describe("claims the homepage must not make", () => {
  it.each([
    [
      "size chart",
      "no size chart has ever existed — `variants` is raw AliExpress JSON, so the promise sent shoppers looking for a page that isn't there",
    ],
    [
      "vets recommend",
      "an uncited authority claim; the strategy forbids it without a source to link",
    ],
    [
      "seamless",
      "an unverifiable construction promise — nothing in the catalogue confirms a garment is seamless",
    ],
    [
      "organic",
      "an uncited fibre-superiority claim about a dropship catalogue whose fabric content is not verified per product",
    ],
    [
      "bamboo",
      "same as `organic` — the fibre content comes from AliExpress listings and is not verified",
    ],
    [
      "UPF",
      "a product-attribute claim (a UV protection rating) that no listing substantiates",
    ],
  ])("no source claims %j — %s", (phrase) => {
    expect(filesContaining(phrase)).toEqual([]);
  });
});

describe("the retired /categories route stays retired", () => {
  it("has no href pointing at /categories anywhere in the app", () => {
    // The route is deleted; /categories now only exists as a 308 to /products
    // in next.config.ts, there for stale external links and old indexed URLs.
    // An in-app <Link> should point straight at the real destination — a
    // stale one here would send every click through an unnecessary redirect
    // hop instead.
    expect(filesContaining('href="/categories"')).toEqual([]);
  });
});
