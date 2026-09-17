import { describe, it, expect } from "vitest";
import { generateStaticParams } from "@/app/[collection]/page";
import { COLLECTION_SLUGS } from "@/lib/collections";

describe("generateStaticParams matches the collection roster exactly", () => {
  it("returns one params entry per collection slug, in the config's order", () => {
    // With `dynamicParams = false`, this list is the complete set of URLs
    // that render — anything the config has but this misses is a 404 despite
    // being "in" the collections config.
    expect(generateStaticParams()).toEqual(
      COLLECTION_SLUGS.map((collection) => ({ collection }))
    );
  });
});
