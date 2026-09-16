import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "../json-ld";

const BREAKOUT = "</script><script>alert(1)</script>";

describe("serializeJsonLd", () => {
  it("escapes `<` so no closing tag can appear in the payload", () => {
    expect(serializeJsonLd({ name: BREAKOUT })).not.toContain("</script>");
    expect(serializeJsonLd({ name: BREAKOUT })).toContain("\\u003c");
  });

  it("round-trips losslessly — escaping must not alter real text", () => {
    const value = { name: BREAKOUT, note: "a < b & c > d" };

    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });

  it("escapes nested values, as in the homepage ItemList of product titles", () => {
    const itemList = {
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Sphynx Fleece Hoodie" },
        { "@type": "ListItem", position: 2, name: BREAKOUT },
      ],
    };
    const serialized = serializeJsonLd(itemList);

    expect(serialized).not.toContain("</script>");
    expect(JSON.parse(serialized).itemListElement[1].name).toBe(BREAKOUT);
  });

  it("leaves ordinary payloads byte-identical to JSON.stringify", () => {
    const plain = { name: "Sphynx Cat Sweater", price: "24.99" };

    expect(serializeJsonLd(plain)).toBe(JSON.stringify(plain));
  });

  it("survives a bare `<` without breaking the JSON", () => {
    expect(JSON.parse(serializeJsonLd({ name: "<" }))).toEqual({ name: "<" });
  });
});
