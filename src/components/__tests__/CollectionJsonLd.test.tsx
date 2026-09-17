import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CollectionJsonLd from "@/components/CollectionJsonLd";
import { getCollection } from "@/lib/collections";
import { SITE_URL } from "@/lib/seo/merchant-policy";
import { ORGANIZATION_ID, WEBSITE_ID } from "@/lib/seo/organization";

/** Same fixture and helpers as JsonLd.test.tsx — see that file's comment. */
const BREAKOUT = "</script><script>alert(1)</script>";

const collection = getCollection("sphynx-cat-sweaters")!;

const products = [
  { slug: "sphynx-cat-sweater-classic-knit", title: "Sphynx Cat Sweater — Classic Knit" },
  { slug: "sphynx-cat-turtleneck-everyday-fleece", title: "Sphynx Cat Turtleneck — Everyday Fleece" },
];

const breadcrumbItems = [
  { name: "Home", url: SITE_URL },
  { name: collection.name, url: `${SITE_URL}/${collection.slug}` },
];

function payloadOf(html: string) {
  return html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>"));
}

function expectSingleScriptElement(html: string) {
  expect(html.match(/<\/script>/g)).toHaveLength(1);
  expect(html).not.toContain("<script>alert(1)");
}

function render(overrides: Partial<Parameters<typeof CollectionJsonLd>[0]> = {}) {
  const html = renderToStaticMarkup(
    <CollectionJsonLd
      collection={collection}
      products={products}
      breadcrumbItems={breadcrumbItems}
      {...overrides}
    />
  );
  return JSON.parse(payloadOf(html));
}

describe("CollectionJsonLd graph shape", () => {
  it("emits exactly one script with the four expected node types", () => {
    const html = renderToStaticMarkup(
      <CollectionJsonLd collection={collection} products={products} breadcrumbItems={breadcrumbItems} />
    );
    expectSingleScriptElement(html);

    const parsed = JSON.parse(payloadOf(html));
    const types = parsed["@graph"].map((node: { "@type": string }) => node["@type"]);
    expect(types).toEqual(["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"]);
  });

  it("cross-references the site's one Organization and WebSite, not a copy", () => {
    const parsed = render();
    const collectionPage = parsed["@graph"][0];

    expect(collectionPage.isPartOf).toEqual({ "@id": WEBSITE_ID });
    expect(collectionPage.about).toEqual({ "@id": ORGANIZATION_ID });
  });

  it("resolves mainEntity and breadcrumb to the ids actually present in the graph", () => {
    const parsed = render();
    const [collectionPage, itemList, breadcrumbList] = parsed["@graph"];

    expect(collectionPage.mainEntity).toEqual({ "@id": itemList["@id"] });
    expect(collectionPage.breadcrumb).toEqual({ "@id": breadcrumbList["@id"] });
  });

  it("keeps numberOfItems equal to the grid the page actually renders", () => {
    const parsed = render();
    const itemList = parsed["@graph"][1];

    expect(itemList.numberOfItems).toBe(products.length);
    expect(itemList.itemListElement).toHaveLength(products.length);
  });

  it("points every ListItem url at the real product page, matching the grid link", () => {
    const parsed = render();
    const itemList = parsed["@graph"][1];

    for (const [index, product] of products.entries()) {
      expect(itemList.itemListElement[index]).toMatchObject({
        position: index + 1,
        name: product.title,
        url: `${SITE_URL}/products/${product.slug}`,
      });
    }
  });

  it("never nests a Product node in the ItemList", () => {
    // A nested Product with no `offers` would be a second, weaker entity for
    // the same URL, and risks disagreeing with the PDP's own ProductJsonLd.
    const parsed = render();
    const serialized = JSON.stringify(parsed["@graph"][1]);

    expect(serialized).not.toContain('"@type":"Product"');
  });

  it("carries exactly the collection's own FAQs, matching the visible accordion", () => {
    const parsed = render();
    const faqPage = parsed["@graph"][3];

    expect(faqPage.mainEntity).toHaveLength(collection.faqs.length);
    expect(faqPage.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: collection.faqs[0].question,
      acceptedAnswer: { "@type": "Answer", text: collection.faqs[0].answer },
    });
  });
});

describe("CollectionJsonLd script-breakout escaping", () => {
  it("neutralizes a breakout in a product title", () => {
    const html = renderToStaticMarkup(
      <CollectionJsonLd
        collection={collection}
        products={[{ slug: "x", title: BREAKOUT }]}
        breadcrumbItems={breadcrumbItems}
      />
    );

    expectSingleScriptElement(html);
  });

  it("neutralizes a breakout in a breadcrumb name", () => {
    const html = renderToStaticMarkup(
      <CollectionJsonLd
        collection={collection}
        products={products}
        breadcrumbItems={[{ name: BREAKOUT, url: SITE_URL }]}
      />
    );

    expectSingleScriptElement(html);
  });
});
