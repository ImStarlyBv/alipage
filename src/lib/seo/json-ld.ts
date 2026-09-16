/**
 * Serialize a JSON-LD object for the body of a
 * `<script type="application/ld+json">` element.
 *
 * `JSON.stringify` escapes quotes but not `<`, so any value containing
 * `</script>` — an AliExpress-sourced product title, a customer-submitted
 * review body — closes the element early and the remainder parses as live
 * HTML. `<` is a valid JSON escape, so the payload stays byte-for-byte
 * equivalent to a JSON parser while being inert to the HTML parser.
 */
export function serializeJsonLd(jsonLd: unknown) {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}
