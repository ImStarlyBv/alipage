import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProductGrid from "@/components/ProductGrid";

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    slug: "sphynx-cat-fleece-hoodie",
    title: "Sphynx Cat Fleece Hoodie",
    images: ["https://cdn.kittycontrol.shop/hoodie.webp"],
    salePrice: 24.99,
    stock: 5,
    ...overrides,
  };
}

describe("ProductGrid renders a crawlable grid, not a JS-driven one", () => {
  it("emits one real <a href> per product", () => {
    const html = renderToStaticMarkup(
      <ProductGrid
        products={[
          product({ id: "p1", slug: "sphynx-cat-fleece-hoodie" }),
          product({ id: "p2", slug: "sphynx-cat-sweater-classic-knit" }),
        ]}
      />
    );

    expect(html).toContain('href="/products/sphynx-cat-fleece-hoodie"');
    expect(html).toContain('href="/products/sphynx-cat-sweater-classic-knit"');
    expect(html.match(/<a /g)).toHaveLength(2);
  });

  it("marks only the first four cards as LCP priority", () => {
    const products = Array.from({ length: 6 }, (_, i) =>
      product({
        id: `p${i}`,
        slug: `product-${i}`,
        images: [`https://cdn.kittycontrol.shop/product-${i}.webp`],
      })
    );
    const html = renderToStaticMarkup(<ProductGrid products={products} />);

    // next/image only emits a preload <link> for priority images.
    expect(html.match(/<link rel="preload" as="image"/g)?.length ?? 0).toBe(4);
  });

  it("shows the empty state instead of an empty grid when there are no products", () => {
    const html = renderToStaticMarkup(<ProductGrid products={[]} emptyMessage="Nothing here yet." />);

    expect(html).toContain("Nothing here yet.");
    expect(html).not.toContain("<a ");
  });
});
