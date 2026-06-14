import Link from "next/link";
import Image from "next/image";
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

/* ── Category cards ── */
const clothingCategories = [
  {
    name: "Sphynx Sweaters",
    description:
      "Soft, stretchy knit sweaters that keep your hairless cat warm indoors and out",
    emoji: "🧶",
  },
  {
    name: "Shirts & Tees",
    description:
      "Lightweight cotton shirts and tank tops for everyday lounging and oil absorption",
    emoji: "👕",
  },
  {
    name: "Pajamas & Onesies",
    description:
      "Full-body onesies and pajamas with snug, seamless fits for sensitive skin",
    emoji: "🩱",
  },
  {
    name: "Hoodies",
    description:
      "Cozy hooded tops for extra warmth on cold mornings and chilly homes",
    emoji: "🧥",
  },
  {
    name: "Winter & Fleece",
    description:
      "Fleece-lined layers and turtlenecks for the coldest months of the year",
    emoji: "❄️",
  },
  {
    name: "Costumes",
    description:
      "Fun seasonal and holiday costumes designed to fit a slender feline build",
    emoji: "🎃",
  },
];

/* ── "Happy cats" gallery — real owners + their dressed-up hairless royalty.
   Alt text deliberately leans on synonyms (onesie, jumper, fleece, costume…)
   instead of repeating the exact "sphynx cat clothes" head term, so this
   section adds semantic depth without cannibalising the money keyword. ── */
const happyCats = [
  {
    src: "/happy-cats/4.webp",
    alt: "Wrinkly-skinned kitten dozing in a soft mint-green onesie, cradled in its owner's arms",
    caption: "Pajama party for one very sleepy pharaoh",
  },
  {
    src: "/happy-cats/5.webp",
    alt: "Big-eared naked kitty in a navy star-print bodysuit, pawing at a feather toy",
    caption: "Playtime in a starry little bodysuit",
  },
  {
    src: "/happy-cats/9.webp",
    alt: "Sphynx lounging on its human's lap in a soft lavender fleece jumper",
    caption: "Lilac fleece, maximum floof-free cuddles",
  },
  {
    src: "/happy-cats/7.webp",
    alt: "Bald cat bundled in a cosy beige knitted top beside warm fairy lights",
    caption: "A knitted jumper fit for feline royalty",
  },
  {
    src: "/happy-cats/8.webp",
    alt: "Wide-eyed furless kitty snuggled in a grey turtleneck on the sofa",
    caption: "Grey turtleneck, regal attitude",
  },
  {
    src: "/happy-cats/6.webp",
    alt: "Velvet-skinned cat dressed up in a playful yellow-and-denim costume",
    caption: "When your little monarch demands a costume change",
  },
];

/* ── FAQ data (also used for FAQPage JSON-LD) ── */
const faqItems = [
  {
    question: "Do sphynx cats need to wear clothes?",
    answer:
      "Yes — because sphynx and other hairless breeds have no fur, they lose body heat far faster than coated cats and feel the cold quickly. A breathable knit sweater or shirt helps them hold warmth in cool homes and winter weather. Clothing also absorbs the skin oils (sebum) a coat-free cat naturally produces, keeping both your pet and your furniture cleaner between baths.",
  },
  {
    question: "What fabric is best for sphynx cat clothes?",
    answer:
      "Soft, breathable natural fibers are best. Organic cotton and bamboo blends are gentle on delicate, bare skin, wick away excess oils, and resist irritation. For colder days, fleece-lined sweaters add warmth without bulk. Avoid rough wool or itchy seams — look for seamless or flat-seam construction so nothing rubs against the skin.",
  },
  {
    question: "How do I choose the right size for my sphynx?",
    answer:
      "Measure your cat's neck, chest (the widest point behind the front legs) and back length from neck to tail base, then match those numbers to our size chart on each product. These cats have slim bodies and broad chests, so stretchy fabric with a snug-but-not-tight fit works best. When in doubt between two sizes, size up for comfort and easy movement.",
  },
  {
    question: "How many outfits does a hairless cat need?",
    answer:
      "Because coat-free cats secrete skin oils throughout the day, vets recommend keeping 3–5 sets in rotation so there's always a clean one while others are washed. Change and wash garments regularly with a mild, baby-grade detergent. Rotating outfits keeps your pet's skin clean and prevents clogged pores or blackheads from oily fabric.",
  },
  {
    question: "Do you offer free shipping on sphynx cat clothes?",
    answer:
      "Yes! Kitty Control offers free worldwide shipping on every order. Whether you buy a single cosy sweater or a full seasonal wardrobe of shirts, hoodies and pajamas, shipping is always on us. Most orders arrive within 7–20 business days depending on your location.",
  },
  {
    question: "Will these clothes fit Devon Rex and Cornish Rex cats too?",
    answer:
      "They can. Our outfits are cut for slim, athletic feline bodies, so they also suit near-hairless and short-coated breeds like the Devon Rex, Cornish Rex and Peterbald. Always check the measurements on the size chart against your individual cat, since body shape varies between breeds.",
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
          Discover a curated collection of cosy knits, breathable cotton shirts,
          pajamas, hoodies and winter outfits — all made to keep a furless feline
          warm, comfortable and protected. Soft, stretchy, seamless fits for
          sensitive skin, with free worldwide shipping on every order.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Shop the Collection
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
          Why Owners Choose Kitty Control
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/60">
          We design and handpick apparel made specifically for sphynx and other
          coat-free breeds. Whether you have a shivering kitten, an oil-prone
          adult, or a senior who feels every draft, there&apos;s a perfect outfit
          to keep them cosy.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-beige p-6 text-center">
            <span className="text-3xl">🔥</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Real Warmth, No Bulk
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Bald cats lose body heat fast. Our knit sweaters and fleece layers
              trap warmth in a lightweight, stretchy fit that never restricts
              movement — perfect for cool homes and winter.
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
              rubs against your cat&apos;s delicate, bare skin.
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 p-6 text-center">
            <span className="text-3xl">💰</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Great Value Prices
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Build a full wardrobe without breaking the bank. From everyday
              shirts to winter hoodies, every piece is priced for owners who want
              quality and value.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ Shop by Category ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            Shop by Category
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-foreground/60">
            Find the perfect outfit for your cat — from warm sweaters and cosy
            hoodies to lightweight shirts and full-body pajamas.
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
              New Arrivals
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

      {/* ═══════════════ Happy Cats Gallery — "Egyptian Kings" ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          Meet Our Happy Little Egyptian Kings 👑
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/60">
          Every sphynx is royalty in our eyes — and these bald little pharaohs
          know it. Here are a few of our favourite hairless cuties showing off
          their cosy knits, snug onesies and downright regal outfits. Warm
          skin, happy purrs, zero shivers.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {happyCats.map((cat) => (
            <figure
              key={cat.src}
              className="overflow-hidden rounded-2xl bg-beige shadow-sm"
            >
              <Image
                src={cat.src}
                alt={cat.alt}
                width={800}
                height={533}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full object-cover"
              />
              <figcaption className="px-4 py-3 text-center text-sm text-foreground/60">
                {cat.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-foreground/60">
          Ready to crown your own naked little monarch? Browse warm layers,
          breathable bodysuits and playful costumes made to fit a hairless cat&apos;s
          slender, royal frame.
        </p>
        <div className="mt-5 text-center">
          <Link
            href="/products"
            className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Dress Your Hairless King
          </Link>
        </div>
      </section>

      {/* ═══════════════ Why Sphynx Cats Need Clothes — SEO Content ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            Why Do Sphynx Cats Need Clothes?
          </h2>
          <div className="mt-6 space-y-4 text-foreground/70 text-sm leading-relaxed sm:text-base">
            <p>
              Unlike coated breeds, the <strong>sphynx</strong> has no fur to
              insulate its body, so it loses heat quickly and feels cold long
              before you do. That&apos;s the main reason bald cats benefit from
              clothing: a well-fitted <strong>knit sweater</strong> traps body
              heat and keeps your cat comfortable in air-conditioned rooms,
              drafty apartments, and cold winter months.
            </p>
            <p>
              Warmth isn&apos;t the only benefit. Coat-free cats constantly
              produce skin oils (sebum) that fur would normally absorb.
              Breathable <strong>cotton garments</strong> soak up that excess
              oil, keeping your cat&apos;s skin balanced and your sofa, bedding
              and clothes free of greasy marks between baths. Lightweight shirts
              and pajamas are ideal for everyday oil absorption, while UPF-rated
              outfits add sun protection for cats who enjoy sunny windowsills or
              supervised time outdoors.
            </p>
            <p>
              The key to dressing a furless feline is the right fabric and fit.
              Choose soft, breathable materials like{" "}
              <strong>organic cotton and bamboo</strong> that are gentle on bare
              skin, and look for <strong>seamless or flat-seam</strong>{" "}
              construction so nothing chafes. These cats have slim bodies and
              broad chests, so stretchy fabric with a snug — but never tight —
              fit gives them full freedom to stretch, pounce and play.
            </p>
            <p>
              At Kitty Control, every outfit is chosen for softness,
              breathability, and a true-to-size fit. Whether you&apos;re dressing
              a hairless kitten for its first winter, keeping an oily adult&apos;s
              skin clean, or helping a senior stay warm, you&apos;ll find the
              right <strong>sphynx cat clothes</strong> here.
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
            The best outfits balance warmth, breathability and comfort. Start
            with fabric: organic cotton and bamboo blends are soft,
            hypoallergenic and excellent at wicking away skin oils, which makes
            them ideal for daily wear. For cold weather, fleece-lined sweaters
            and turtlenecks add insulation without heavy bulk, while
            moisture-wicking pajamas keep your cat cosy overnight.
          </p>
          <p>
            Fit matters just as much as fabric. Measure your cat&apos;s neck,
            chest and back length and compare them to the size chart on every
            product page. Because these cats have lean frames and wide chests,
            stretchy four-way fabric and a seamless cut prevent rubbing and let
            your pet move freely. If your cat is between sizes, size up — a
            slightly roomy sweater is far more comfortable than a tight one.
          </p>
          <p>
            Finally, plan for rotation. Since bald cats secrete oil all day, keep
            3–5 outfits on hand so there&apos;s always a clean set while others
            are washed in a gentle, baby-grade detergent. A small wardrobe of
            shirts, sweaters and a hoodie or two covers every season and keeps
            your cat&apos;s skin healthy year-round.
          </p>
        </div>
      </section>

      {/* ═══════════════ Clothes for Every Season ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            A Hairless Cat Wardrobe for Every Season
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-secondary/30 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                ☀️ Spring &amp; Summer
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                Lightweight cotton shirts, tank tops and breathable bodysuits
                that absorb skin oils and offer sun protection without
                overheating your cat on warm days.
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
                Mid-weight sweaters and long-sleeve shirts for cooler mornings.
                Soft, stretchy knits keep your cat warm indoors as the
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
                coldest months. Maximum warmth for bald cats who feel every
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
          Frequently Asked Questions
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
