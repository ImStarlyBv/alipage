import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ORGANIZATION,
  ORGANIZATION_CONTACT_EMAIL,
  ORGANIZATION_ID,
  ORGANIZATION_LOGO_PATH,
  ORGANIZATION_SAME_AS,
  SITE_JSON_LD,
  WEBSITE,
  WEBSITE_ID,
} from "../organization";
import { ProductJsonLd } from "@/components/JsonLd";
import { serializeJsonLd } from "../json-ld";

function payloadOf(html: string) {
  return html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>"));
}

const product = {
  title: "Sphynx Cat Fleece Hoodie",
  description: "Warm brushed fleece hoodie.",
  images: ["https://cdn.kittycontrol.shop/hoodie.webp"],
  salePrice: 24.99,
  stock: 5,
  slug: "sphynx-cat-fleece-hoodie",
};

describe("site graph identity", () => {
  it("gives the Organization and the WebSite distinct ids, and the graph holds both", () => {
    // A copy-paste that reuses one `@id` for both nodes would silently merge
    // two different entities into one.
    expect(ORGANIZATION_ID).not.toBe(WEBSITE_ID);
    expect(SITE_JSON_LD["@graph"]).toHaveLength(2);
    expect(SITE_JSON_LD["@graph"].map((node) => node["@id"])).toEqual([
      ORGANIZATION_ID,
      WEBSITE_ID,
    ]);
  });

  it("resolves the WebSite publisher inside the graph, without restating the name", () => {
    expect(WEBSITE.publisher).toEqual({ "@id": ORGANIZATION_ID });
    const ids = SITE_JSON_LD["@graph"].map((node) => node["@id"]);

    expect(ids).toContain(WEBSITE.publisher["@id"]);
  });

  it("types the Organization as a Brand so a brand reference can resolve to it", () => {
    // `ProductJsonLd` points each product's brand at this `@id`. A `Brand`
    // reference resolving to a node that isn't one is the failure this guards.
    expect(ORGANIZATION["@type"]).toContain("Organization");
    expect(ORGANIZATION["@type"]).toContain("Brand");
  });

  it("is valid JSON that survives serialization", () => {
    expect(JSON.parse(serializeJsonLd(SITE_JSON_LD))).toEqual(SITE_JSON_LD);
  });
});

describe("product brand points at the one Organization node", () => {
  it("references the Organization @id rather than declaring a second brand", () => {
    const html = renderToStaticMarkup(<ProductJsonLd product={product} />);
    const parsed = JSON.parse(payloadOf(html));

    expect(parsed.brand["@id"]).toBe(ORGANIZATION_ID);
  });

  it("keeps the brand name, so a consumer that ignores @id still gets it", () => {
    const html = renderToStaticMarkup(<ProductJsonLd product={product} />);

    expect(JSON.parse(payloadOf(html)).brand.name).toBe(ORGANIZATION.name);
  });
});

describe("claims the schema must not make", () => {
  it("advertises no SearchAction, because /products never reads a q param", () => {
    // The graph used to advertise `SearchAction` on `/products?q={...}`. There
    // is no search box and no `q` handling, so the schema promised a feature
    // that does not exist. It comes back only alongside a real search.
    const serialized = serializeJsonLd(SITE_JSON_LD);

    expect(serialized).not.toContain("SearchAction");
    expect(serialized).not.toContain("potentialAction");
  });

  it.each([
    ["logo", ORGANIZATION_LOGO_PATH === null, "logo"],
    ["sameAs", ORGANIZATION_SAME_AS.length === 0, "sameAs"],
    ["contactPoint", ORGANIZATION_CONTACT_EMAIL === null, "contactPoint"],
  ])(
    "emits %s only when a real value exists, never a URL we cannot serve",
    (_label, isUnset, field) => {
      // Emitting an unserved logo URL or a profile that isn't ours is a false
      // brand-identity claim; a contactPoint with no email is invalid schema.
      // The invariant holds either way: unset in, absent out.
      if (isUnset) {
        expect(ORGANIZATION).not.toHaveProperty(field);
      } else {
        expect(ORGANIZATION).toHaveProperty(field);
      }
    }
  );
});
