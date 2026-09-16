import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";

/**
 * The payload that would break out of the JSON-LD <script> element and start a
 * new one. `JSON.stringify` does not escape `<`, so an unescaped write of this
 * string terminates the tag early and the remainder parses as live HTML.
 */
const BREAKOUT = "</script><script>alert(1)</script>";

function product(overrides: Record<string, unknown> = {}) {
  return {
    title: "Sphynx Cat Fleece Hoodie",
    description: "<p>Warm brushed fleece hoodie.</p>",
    images: ["https://cdn.kittycontrol.shop/hoodie.webp"],
    salePrice: 24.99,
    stock: 5,
    slug: "sphynx-cat-fleece-hoodie",
    category: { name: "Hoodies" },
    ...overrides,
  };
}

/** Everything the browser would parse as the script element's contents. */
function payloadOf(html: string) {
  return html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>"));
}

/** A breakout is closed only when exactly the element's own closing tag remains. */
function expectSingleScriptElement(html: string) {
  expect(html.match(/<\/script>/g)).toHaveLength(1);
  expect(html).not.toContain("<script>alert(1)");
}

describe("JsonLd script-breakout escaping", () => {
  it("neutralizes a breakout in an AliExpress-sourced product title", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd product={product({ title: BREAKOUT })} />
    );

    expectSingleScriptElement(html);
  });

  it("neutralizes a breakout in a customer-submitted review", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd
        product={product()}
        rating={{ average: 5, count: 1 }}
        reviews={[
          {
            rating: 5,
            body: BREAKOUT,
            authorName: BREAKOUT,
            createdAt: new Date("2026-01-01"),
          },
        ]}
      />
    );

    expectSingleScriptElement(html);
  });

  it("neutralizes a breakout in a breadcrumb name", () => {
    const html = renderToStaticMarkup(
      <BreadcrumbJsonLd
        items={[
          { name: BREAKOUT, url: "https://kittycontrol.shop/products/x" },
        ]}
      />
    );

    expectSingleScriptElement(html);
  });

  it("stays valid, lossless JSON — escaping must not corrupt real text", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd product={product({ title: BREAKOUT })} />
    );
    const parsed = JSON.parse(payloadOf(html));

    expect(parsed.name).toBe(BREAKOUT);
    expect(parsed["@type"]).toBe("Product");
  });

  it("leaves ordinary titles untouched", () => {
    const html = renderToStaticMarkup(<ProductJsonLd product={product()} />);

    expect(JSON.parse(payloadOf(html)).name).toBe("Sphynx Cat Fleece Hoodie");
  });
});
