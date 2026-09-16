import { describe, it, expect } from "vitest";
import { planSlugAssignments } from "../backfill-product-slugs.js";

// The backfill runs once per deploy against the live catalog, so "did it change
// a URL" and "could it violate the unique index" are the two questions that
// matter. Both are decided entirely inside planSlugAssignments, which is pure —
// so they are testable without a database.

describe("planSlugAssignments", () => {
  it("slugs every product when none have one yet", () => {
    const active = [
      { id: "a", title: "Sphynx Fleece Hoodie" },
      { id: "b", title: "Cotton Cat Tee" },
    ];

    const { assignments } = planSlugAssignments(active, []);

    expect(assignments).toEqual([
      { id: "a", slug: "sphynx-fleece-hoodie" },
      { id: "b", slug: "cotton-cat-tee" },
    ]);
  });

  it("is a no-op once every product has a slug", () => {
    const active = [
      { id: "a", title: "Sphynx Fleece Hoodie" },
      { id: "b", title: "Cotton Cat Tee" },
    ];
    const existing = [
      { id: "a", slug: "sphynx-fleece-hoodie" },
      { id: "b", slug: "cotton-cat-tee" },
    ];

    const { assignments, alreadySetCount } = planSlugAssignments(
      active,
      existing
    );

    expect(assignments).toEqual([]);
    expect(alreadySetCount).toBe(2);
  });

  it("never rewrites an existing slug, even after the title changed", () => {
    // This is the whole point of persisting slugs: `a` was renamed, but its URL
    // must stay put. The backfill fills NULLs only.
    const active = [{ id: "a", title: "Renamed Sphynx Hoodie Redux" }];
    const existing = [{ id: "a", slug: "sphynx-fleece-hoodie" }];

    const { assignments } = planSlugAssignments(active, existing);

    expect(assignments).toEqual([]);
  });

  it("gives duplicates to the oldest, suffixing later ones", () => {
    const active = [
      { id: "old", title: "Fleece Hoodie" },
      { id: "mid", title: "Fleece Hoodie" },
      { id: "new", title: "Fleece Hoodie" },
    ];

    const { assignments } = planSlugAssignments(active, []);

    expect(assignments.map((a) => a.slug)).toEqual([
      "fleece-hoodie",
      "fleece-hoodie-2",
      "fleece-hoodie-3",
    ]);
  });

  it("escalates past a suffix already held by an inactive product", () => {
    // `hidden` is inactive, so it is absent from the active rows the slug map is
    // built from — but it still owns `fleece-hoodie-2` in the table. Assigning
    // that slug would violate the unique index, so the plan must skip past it.
    const active = [
      { id: "old", title: "Fleece Hoodie" },
      { id: "new", title: "Fleece Hoodie" },
    ];
    const existing = [{ id: "hidden", slug: "fleece-hoodie-2" }];

    const { assignments } = planSlugAssignments(active, existing);

    expect(assignments).toEqual([
      { id: "old", slug: "fleece-hoodie" },
      { id: "new", slug: "fleece-hoodie-3" },
    ]);
  });

  it("escalates past a taken bare slug", () => {
    const active = [{ id: "new", title: "Fleece Hoodie" }];
    const existing = [{ id: "hidden", slug: "fleece-hoodie" }];

    const { assignments } = planSlugAssignments(active, existing);

    expect(assignments).toEqual([{ id: "new", slug: "fleece-hoodie-2" }]);
  });

  it("assigns two same-titled products distinct slugs in one pass", () => {
    // Guards against planning each product independently and handing two of
    // them the same free candidate.
    const active = [
      { id: "new1", title: "Fleece Hoodie" },
      { id: "new2", title: "Fleece Hoodie" },
    ];
    const existing = [{ id: "hidden", slug: "fleece-hoodie" }];

    const { assignments } = planSlugAssignments(active, existing);
    const slugs = assignments.map((a) => a.slug);

    expect(slugs).toEqual(["fleece-hoodie-2", "fleece-hoodie-3"]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("never plans two products onto the same slug", () => {
    const active = [
      { id: "a", title: "Fleece Hoodie" },
      { id: "b", title: "Fleece Hoodie" },
      { id: "c", title: "Fleece Hoodie" },
      { id: "d", title: "Cotton Tee" },
    ];
    const existing = [
      { id: "x", slug: "fleece-hoodie-2" },
      { id: "y", slug: "cotton-tee" },
    ];

    const { assignments } = planSlugAssignments(active, existing);
    const all = [...existing.map((e) => e.slug), ...assignments.map((a) => a.slug)];

    expect(new Set(all).size).toBe(all.length);
  });

  it("handles a product whose title slugifies to the fallback", () => {
    const active = [{ id: "a", title: "!!! & ???" }];

    const { assignments } = planSlugAssignments(active, []);

    expect(assignments).toEqual([{ id: "a", slug: "product" }]);
  });
});
