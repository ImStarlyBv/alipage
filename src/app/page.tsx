import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/models";
import ProductCard from "@/components/ProductCard";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";

/* ── ISR: re-generate every hour so Googlebot always gets static HTML ── */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sphynx Cat Clothes — Warm Sweaters & Shirts for Hairless Cats",
  description:
    "Shop sphynx cat clothes made for hairless cats — breathable cotton sweaters, shirts, pajamas, hoodies and winter outfits that keep your sphynx warm and absorb skin oils. Free worldwide shipping from Kitty Control.",
  alternates: {
    canonical: "/",
  },
};

/* ── Category cards (keyword-targeted) ── */
const clothingCategories = [
  {
    name: "Sphynx Sweaters",
    description:
      "Soft, stretchy knit sweaters that keep your hairless cat warm indoors and out",
    keywords: "sphynx cat sweater, hairless cat sweater, sphynx cat clothes",
    emoji: "🧶",
  },
  {
    name: "Shirts & Tees",
    description:
      "Lightweight cotton shirts and tank tops for everyday lounging and oil absorption",
    keywords: "sphynx cat shirt, hairless cat shirt, sphynx cat t-shirt",
    emoji: "👕",
  },
  {
    name: "Pajamas & Onesies",
    description:
      "Full-body onesies and pajamas with snug, seamless fits for sensitive skin",
    keywords: "sphynx cat pajamas, sphynx cat onesie, hairless cat bodysuit",
    emoji: "🩱",
  },
  {
    name: "Hoodies",
    description:
      "Cozy hooded tops for extra warmth on cold mornings and chilly homes",
    keywords: "sphynx cat hoodie, hairless cat hoodie, warm sphynx clothes",
    emoji: "🧥",
  },
  {
    name: "Winter & Fleece",
    description:
      "Fleece-lined layers and turtlenecks for the coldest months of the year",
    keywords: "sphynx winter clothes, sphynx fleece, warm hairless cat clothes",
    emoji: "❄️",
  },
  {
    name: "Costumes",
    description:
      "Fun seasonal and holiday costumes designed to fit a sphynx's slender build",
    keywords: "sphynx cat costume, hairless cat costume, sphynx outfit",
    emoji: "🎃",
  },
];

/* ── FAQ data (also used for FAQPage JSON-LD) ── */
const faqItems = [
  {
    question: "Do sphynx cats need to wear clothes?",
    answer:
      "Yes — because sphynx and other hairless cats have no fur, they lose body heat far faster than coated breeds and feel the cold quickly. A breathable sphynx cat sweater or shirt helps them hold warmth in cool homes and winter weather. Clothing also absorbs the skin oils (sebum) a hairless cat naturally produces, keeping both your cat and your furniture cleaner between baths.",
  },
  {
    question: "What fabric is best for sphynx cat clothes?",
    answer:
      "Soft, breathable natural fibers are best. Organic cotton and bamboo blends are gentle on a sphynx's delicate skin, wick away excess oils, and resist irritation. For colder days, fleece-lined sweaters add warmth without bulk. Avoid rough wool or itchy seams — look for seamless or flat-seam construction so nothing rubs against bare skin.",
  },
  {
    question: "How do I choose the right size for my sphynx?",
    answer:
      "Measure your cat's neck, chest (the widest point behind the front legs) and back length from neck to tail base, then match those numbers to our size chart on each product. Sphynx cats have slim bodies and broad chests, so stretchy fabric with a snug-but-not-tight fit works best. When in doubt between two sizes, size up for comfort and easy movement.",
  },
  {
    question: "How many outfits does a hairless cat need?",
    answer:
      "Because hairless cats secrete skin oils throughout the day, vets recommend keeping 3–5 sets of clothes in rotation so there's always a clean one while others are washed. Change and wash garments regularly with a mild, baby-grade detergent. Rotating outfits keeps your sphynx's skin clean and prevents clogged pores or blackheads from oily fabric.",
  },
  {
    question: "Do you offer free shipping on sphynx cat clothes?",
    answer:
      "Yes! Kitty Control offers free worldwide shipping on every order. Whether you buy a single sphynx cat sweater or a full seasonal wardrobe of shirts, hoodies and pajamas, shipping is always on us. Most orders arrive within 7–20 business days depending on your location.",
  },
  {
    question: "Will these clothes fit Devon Rex and Cornish Rex cats too?",
    answer:
      "They can. Our sphynx cat clothes are cut for slim, athletic feline bodies, so they also suit near-hairless and short-coated breeds like the Devon Rex, Cornish Rex and Peterbald. Always check the measurements on the size chart against your individual cat, since body shape varies between cats.",
  },
];

export default async function Home() {
  let products: { id: string; title: string; images: unknown; salePrice: unknown; stock: number }[] = [];
  let productsWithSlugs: { id: string; title: string; images: unknown; salePrice: unknown; stock: number; slug: string }[] = [];

  try {
    const [fetched, slugProducts] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          images: true,
          salePrice: true,
          stock: true,
        },
      }),
      prisma.product.findMany({
        where: { active: true },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          title: true,
        },
      }),
    ]);
    products = fetched;
    const slugMap = buildProductSlugMap(slugProducts);
    productsWithSlugs = products.map((product) => ({
      ...product,
      slug: slugMap.get(product.id) || product.id,
    }));
  } catch {
    // DB unreachable at build time — render static content only
    console.warn("[Home] Database unreachable, rendering without products");
  }

  /* ── Structured data ── */
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kitty Control",
    url: "https://kittycontrol.shop",
    description:
      "Online store specializing in sphynx cat clothes for hairless cats — warm sweaters, breathable shirts, pajamas, hoodies and winter outfits.",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://kittycontrol.shop/products?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "New Arrivals — Sphynx Cat Clothes",
    numberOfItems: productsWithSlugs.length,
    itemListElement: productsWithSlugs.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://kittycontrol.shop/products/${p.slug}`,
      name: p.title,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ═══════════════ Hero ═══════════════ */}
      <section className="bg-beige px-4 py-12 text-center sm:py-16 md:py-20">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
          Sphynx Cat Clothes for Warm, Happy Hairless Cats
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/60 sm:text-lg">
          Discover our curated collection of sphynx cat clothes — breathable
          cotton sweaters, shirts, pajamas, hoodies and winter outfits designed
          to keep your hairless cat warm, comfortable, and protected. Soft,
          stretchy, seamless fits for sensitive skin. Free worldwide shipping on
          every order.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Shop Sphynx Cat Clothes
          </Link>
          <Link
            href="/categories"
            className="inline-block rounded-full border border-primary px-8 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-primary/10"
          >
            Browse Categories
          </Link>
        </div>
      </section>

      {/* ═══════════════ Trust Signals ═══════════════ */}
      <section className="border-b border-secondary/20 bg-cream">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 py-5 text-center text-sm text-foreground/60 sm:gap-10 sm:text-base">
          <span className="flex items-center gap-2">
            <span className="text-xl">🚚</span> Free Worldwide Shipping
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xl">🔒</span> Secure Checkout
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xl">🧵</span> Skin-Friendly Fabrics
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xl">🐾</span> Made for Hairless Cats
          </span>
        </div>
      </section>

      {/* ═══════════════ Why Choose Section ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          Why Choose Kitty Control Sphynx Cat Clothes?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/60">
          At Kitty Control, we design and handpick clothes specifically for
          sphynx and other hairless cats. Whether you have a shivering kitten,
          an oil-prone adult, or a senior cat who feels every draft, we have the
          perfect outfit to keep them cozy.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-beige p-6 text-center">
            <span className="text-3xl">🔥</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Real Warmth, No Bulk
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Hairless cats lose body heat fast. Our sphynx cat sweaters and
              fleece layers trap warmth in a lightweight, stretchy fit that
              never restricts movement — perfect for cool homes and winter.
            </p>
          </div>
          <div className="rounded-xl bg-secondary/20 p-6 text-center">
            <span className="text-3xl">🌿</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Skin-Friendly Fabrics
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Breathable organic cotton and bamboo blends absorb skin oils,
              resist irritation, and feature seamless construction so nothing
              rubs against your sphynx&apos;s delicate, bare skin.
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 p-6 text-center">
            <span className="text-3xl">💰</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Great Value Prices
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Build a full hairless-cat wardrobe without breaking the bank.
              From everyday shirts to winter hoodies, our sphynx cat clothes are
              priced for owners who want quality and value.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ Shop by Category ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            Shop Sphynx Cat Clothes by Category
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-foreground/60">
            Find the perfect outfit for your hairless cat — from warm sweaters
            and cozy hoodies to lightweight shirts and full-body pajamas.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {clothingCategories.map((cat) => (
              <Link
                key={cat.name}
                href="/products"
                className="group rounded-xl bg-white p-5 text-center shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <h3 className="mt-2 font-heading text-sm font-semibold text-foreground sm:text-base">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-foreground/50">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Featured Products ═══════════════ */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              New Arrivals — Sphynx Cat Clothes
            </h2>
            <Link
              href="/products"
              className="text-sm text-primary-dark transition-colors hover:text-primary"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {productsWithSlugs.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════ Why Sphynx Cats Need Clothes — SEO Content ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            Why Do Sphynx Cats Need Clothes?
          </h2>
          <div className="mt-6 space-y-4 text-foreground/70 text-sm leading-relaxed sm:text-base">
            <p>
              Unlike coated breeds, the <strong>sphynx cat</strong> has no fur
              to insulate its body, so it loses heat quickly and feels cold long
              before you do. That&apos;s the main reason hairless cats benefit
              from clothing: a well-fitted <strong>sphynx cat sweater</strong>{" "}
              traps body heat and keeps your cat comfortable in air-conditioned
              rooms, drafty apartments, and cold winter months.
            </p>
            <p>
              Warmth isn&apos;t the only benefit. Hairless cats constantly
              produce skin oils (sebum) that would normally be absorbed by fur.
              Breathable <strong>cotton sphynx cat clothes</strong> soak up that
              excess oil, keeping your cat&apos;s skin balanced and your sofa,
              bedding and clothes free of greasy marks between baths. Lightweight
              shirts and pajamas are ideal for everyday oil absorption, while
              UPF-rated outfits add sun protection for cats who enjoy sunny
              windowsills or supervised time outdoors.
            </p>
            <p>
              The key to clothing a hairless cat is the right fabric and fit.
              Choose soft, breathable materials like{" "}
              <strong>organic cotton and bamboo</strong> that are gentle on bare
              skin, and look for <strong>seamless or flat-seam</strong>{" "}
              construction so nothing chafes. Sphynx cats have slim bodies and
              broad chests, so stretchy fabric with a snug — but never tight —
              fit gives them full freedom to stretch, pounce and play.
            </p>
            <p>
              At Kitty Control, every sphynx cat outfit is chosen for softness,
              breathability, and a true-to-size fit. Whether you&apos;re dressing
              a hairless kitten for its first winter, keeping an oily adult&apos;s
              skin clean, or helping a senior cat stay warm, you&apos;ll find the
              perfect sphynx cat clothes here.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ How to Choose Sphynx Cat Clothes ═══════════════ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          How to Choose the Best Clothes for Your Hairless Cat
        </h2>
        <div className="mt-6 space-y-4 text-foreground/70 text-sm leading-relaxed sm:text-base">
          <p>
            The best sphynx cat clothes balance warmth, breathability and
            comfort. Start with fabric: organic cotton and bamboo blends are
            soft, hypoallergenic and excellent at wicking away skin oils, which
            makes them ideal for daily wear. For cold weather, fleece-lined
            sweaters and turtlenecks add insulation without heavy bulk, while
            moisture-wicking pajamas keep your cat cozy overnight.
          </p>
          <p>
            Fit matters just as much as fabric. Measure your cat&apos;s neck,
            chest and back length and compare them to the size chart on every
            product page. Because hairless cats have lean frames and wide chests,
            stretchy four-way fabric and a seamless cut prevent rubbing and let
            your sphynx move freely. If your cat is between sizes, size up — a
            slightly roomy sweater is far more comfortable than a tight one.
          </p>
          <p>
            Finally, plan for rotation. Since hairless cats secrete oil all day,
            keep 3–5 outfits on hand so there&apos;s always a clean set while
            others are washed in a gentle, baby-grade detergent. A small wardrobe
            of shirts, sweaters and a hoodie or two covers every season and keeps
            your sphynx&apos;s skin healthy year-round.
          </p>
        </div>
      </section>

      {/* ═══════════════ Clothes for Every Season ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            Sphynx Cat Clothes for Every Season
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-secondary/30 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                ☀️ Spring &amp; Summer
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                Lightweight cotton shirts, tank tops and breathable bodysuits
                that absorb skin oils and offer sun protection without
                overheating your hairless cat on warm days.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium text-primary-dark hover:text-primary"
              >
                Shop summer clothes &rarr;
              </Link>
            </div>
            <div className="rounded-xl border border-secondary/30 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                🍂 Autumn
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                Mid-weight sphynx cat sweaters and long-sleeve shirts for cooler
                mornings. Soft, stretchy knits keep your cat warm indoors as the
                temperature starts to drop.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium text-primary-dark hover:text-primary"
              >
                Shop autumn sweaters &rarr;
              </Link>
            </div>
            <div className="rounded-xl border border-secondary/30 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                ❄️ Winter
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                Fleece-lined hoodies, turtlenecks and full-body pajamas for the
                coldest months. Maximum warmth for hairless cats who feel every
                chill in your home.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium text-primary-dark hover:text-primary"
              >
                Shop winter clothes &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ Section (native disclosure accordion) ═══════════════ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          Frequently Asked Questions About Sphynx Cat Clothes
        </h2>
        <div className="mt-8 space-y-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              name="sphynx-faq"
              className="group rounded-xl border border-secondary/30 bg-white p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 font-heading text-base font-semibold text-foreground sm:text-lg">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-primary-dark transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground/60 sm:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
