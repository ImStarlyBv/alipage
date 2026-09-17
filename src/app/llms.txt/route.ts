import { prisma } from "@/lib/models";
import { COLLECTIONS } from "@/lib/collections";
import {
  SITE_URL,
  BRAND_NAME,
  SHIPPING_COUNTRIES,
  RETURN_POLICY,
} from "@/lib/seo/merchant-policy";

/* Generated rather than a static file, so it lists the live collections and
   products without a second place to keep in sync. Re-generated hourly,
   matching the ISR window on the pages it links to. */
export const revalidate = 3600;

export async function GET() {
  let products: { id: string; slug: string | null; title: string }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, slug: true, title: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    console.warn("[llms.txt] Database unreachable, rendering without products");
  }

  const lines: string[] = [
    `# ${BRAND_NAME}`,
    "",
    "> Sphynx and hairless cat clothing — sweaters, hoodies, pajamas, shirts " +
      "and winter outfits, shipped worldwide. Kitty Control sources and ships " +
      "every item itself.",
    "",
    "## Collections",
    ...COLLECTIONS.map((c) => `- [${c.name}](${SITE_URL}/${c.slug}): ${c.answer}`),
    "",
    "## Products",
    ...products.map(
      (p) => `- [${p.title}](${SITE_URL}/products/${p.slug ?? p.id})`
    ),
    "",
    "## Shipping & Returns",
    `- Free shipping to ${SHIPPING_COUNTRIES.join(", ")}, typically arriving in 7-20 days after 1-3 days of handling.`,
    `- Returns accepted within ${RETURN_POLICY.merchantReturnDays} days of delivery; the buyer covers return shipping.`,
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
