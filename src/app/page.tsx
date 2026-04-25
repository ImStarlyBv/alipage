import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/models";
import ProductCard from "@/components/ProductCard";
import { buildProductSlugMap } from "@/lib/utils/product-slugs";

/* ── ISR: re-generate every hour so Googlebot always gets static HTML ── */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Best Cat Toys — Interactive Toys for Indoor Cats & Kittens",
  description:
    "Discover the best cat toys for indoor cats and kittens. Shop interactive cat toys, wand toys, chew toys, ball toys, automatic cat toys & enrichment toys for bored cats. Free worldwide shipping from Kitty Control.",
  alternates: {
    canonical: "/",
  },
};

/* ── Category cards ── */
const toyCategories = [
  {
    name: "Interactive Toys",
    description:
      "Stimulating interactive cat toys that keep your feline entertained for hours",
    keywords: "interactive cat toys, cat toys that move, electronic cat toys",
    emoji: "🎯",
  },
  {
    name: "Wand Toys",
    description:
      "Feather wand toys for bonding playtime with your cat or kitten",
    keywords: "cat wand toy, wand toys for cats, flying bird cat toy",
    emoji: "✨",
  },
  {
    name: "Chew Toys",
    description:
      "Durable chew toys for cats and kittens who love to bite and gnaw",
    keywords: "cat chew toys, chew toys for cats, cat teething toys",
    emoji: "🦷",
  },
  {
    name: "Ball Toys",
    description:
      "Rolling and bouncing ball toys that trigger your cat's hunting instincts",
    keywords: "cat ball toy, cat toy ball, cat toys balls",
    emoji: "⚽",
  },
  {
    name: "Plush Toys",
    description:
      "Soft and cuddly plush toys for cats who love to cuddle and kick",
    keywords: "cat plush toy, stuffed cat toy, cat kicker toy",
    emoji: "🧸",
  },
  {
    name: "Automatic Toys",
    description:
      "Self-moving automatic cat toys perfect for busy pet parents",
    keywords: "automatic cat toy, automatic cat toys, moving cat toys",
    emoji: "🤖",
  },
];

/* ── FAQ data (also used for FAQPage JSON-LD) ── */
const faqItems = [
  {
    question: "What are the best cat toys for indoor cats?",
    answer:
      "The best cat toys for indoor cats are interactive toys that simulate prey movement — wand toys, flying bird toys, laser toys, and automatic moving toys. These keep your indoor cat active, prevent boredom, and satisfy natural hunting instincts. At Kitty Control we curate the top-rated interactive cat toys specifically for indoor cats and kittens.",
  },
  {
    question: "Are interactive cat toys safe for kittens?",
    answer:
      "Yes! Our interactive cat toys are selected with kitten safety in mind. We recommend soft plush toys, crinkle ball toys, and small wand toys for kittens under 6 months. Avoid toys with small detachable parts. Our cat toys for kittens are tested for durability and use non-toxic materials.",
  },
  {
    question: "How do automatic cat toys work?",
    answer:
      "Automatic cat toys use batteries or USB charging to move on their own — spinning, rolling, or flapping to mimic the erratic movements of prey. They are perfect for busy pet parents whose indoor cat needs stimulation while home alone. Popular options include robotic mice, flutter bird toys, and smart ball toys.",
  },
  {
    question: "Do you offer free shipping on cat toys?",
    answer:
      "Yes! Kitty Control offers free worldwide shipping on every order. Whether you are buying a single cat wand toy or a full set of enrichment toys for your indoor cat, shipping is always on us. Most orders arrive within 7–20 business days depending on your location.",
  },
  {
    question: "Which cat toys help with boredom and anxiety?",
    answer:
      "Cat enrichment toys like puzzle feeders, spring toys, and catnip kicker toys are excellent for bored cats and cats with separation anxiety. Interactive cat toys that encourage self-play — such as ball track toys and electronic moving toys — keep cats mentally stimulated when their owners are away.",
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
      "Online store specializing in the best cat toys for indoor cats and kittens — interactive toys, wand toys, chew toys, automatic toys and enrichment toys.",
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
    name: "New Arrivals — Cat Toys",
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
          Best Cat Toys for Indoor Cats &amp; Kittens
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/60 sm:text-lg">
          Discover our curated collection of interactive cat toys, wand toys,
          chew toys, ball toys, automatic toys and enrichment toys — designed
          to keep your indoor cat happy, healthy, and entertained. Free
          worldwide shipping on every order.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Shop All Cat Toys
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
            <span className="text-xl">⭐</span> Top-Rated Cat Toys
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xl">🐾</span> Curated for Indoor Cats
          </span>
        </div>
      </section>

      {/* ═══════════════ Why Choose Section ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          Why Choose Kitty Control Cat Toys?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/60">
          At Kitty Control, we handpick the best cat toys to keep your feline
          friend active and engaged. Whether you have a playful kitten, an
          energetic indoor cat, or a senior cat who needs gentle stimulation,
          we&apos;ve got the perfect toy.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-beige p-6 text-center">
            <span className="text-3xl">🐱</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Curated for Cats
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Every interactive cat toy in our store is carefully selected to
              stimulate your cat&apos;s natural hunting instincts, promote
              exercise, and provide enrichment for indoor cats of all ages.
            </p>
          </div>
          <div className="rounded-xl bg-secondary/20 p-6 text-center">
            <span className="text-3xl">🌍</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Free Worldwide Shipping
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              We ship our cat toys worldwide at no extra cost. From interactive
              wand toys to automatic moving toys, get the best cat enrichment
              products delivered to your door.
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 p-6 text-center">
            <span className="text-3xl">💰</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
              Great Value Prices
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Find the best cat toys at prices that won&apos;t break the bank.
              Whether you need chew toys for kittens or puzzle toys for smart
              cats, our prices are unbeatable.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ Shop by Category ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            Shop Cat Toys by Category
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-foreground/60">
            Find the perfect cat toy by browsing our popular categories — from
            interactive toys that move on their own to cozy plush toys your cat
            will love.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {toyCategories.map((cat) => (
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
              New Arrivals — Cat Toys
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

      {/* ═══════════════ What Makes a Great Cat Toy — SEO Content ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            What Makes a Great Cat Toy?
          </h2>
          <div className="mt-6 space-y-4 text-foreground/70 text-sm leading-relaxed sm:text-base">
            <p>
              Not all cat toys are created equal. The best cat toys engage your
              cat&apos;s natural instincts — stalking, chasing, pouncing, and
              biting. For an <strong>indoor cat</strong>, the right toy can mean
              the difference between a bored, destructive cat and a happy,
              healthy companion. Interactive cat toys that mimic the movement
              of birds, mice, and insects are especially effective at keeping
              your indoor cat stimulated.
            </p>
            <p>
              <strong>Wand toys and feather toys</strong> are perfect for
              bonding play sessions. Your cat gets to chase, leap, and swat
              while you control the action — it&apos;s exercise and enrichment
              rolled into one. For solo play, <strong>automatic cat toys</strong>{" "}
              like robotic mice and smart ball toys move unpredictably across
              the floor, triggering your cat&apos;s hunting drive even when
              you&apos;re not home.
            </p>
            <p>
              <strong>Chew toys and teething toys</strong> are essential for
              kittens going through their teething phase, but adult cats benefit
              from them too — they help clean teeth and relieve stress.
              Meanwhile, <strong>catnip toys</strong> and kicker toys provide
              a different kind of stimulation, triggering the euphoric catnip
              response that most cats find irresistible.
            </p>
            <p>
              At Kitty Control, we test and curate every cat toy in our
              collection to ensure it meets our standards for safety, durability,
              and genuine feline engagement. Whether you&apos;re shopping for
              a curious kitten, an active adult indoor cat, or a senior cat who
              needs gentle enrichment — you&apos;ll find the perfect cat toy
              here.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ Best Cat Toys for Indoor Cats ═══════════════ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          Best Cat Toys for Indoor Cats
        </h2>
        <div className="mt-6 space-y-4 text-foreground/70 text-sm leading-relaxed sm:text-base">
          <p>
            Indoor cats need stimulation and enrichment to stay healthy and
            happy. The best cat toys for indoor cats are ones that simulate
            prey movement, encourage exercise, and satisfy your cat&apos;s
            natural hunting instincts. At Kitty Control, we specialize in
            interactive cat toys that keep your indoor cat active — from
            flying bird toys and flapping bird cat toys to automated moving
            toys that your cat can chase all day.
          </p>
          <p>
            If your cat gets bored easily, our selection of cat toys for
            bored cats includes puzzle toys, ball track toys, and spring
            toys that provide hours of self-directed play. Cat enrichment
            toys are essential for preventing behavioral issues like
            scratching furniture or overeating — a common problem for indoor
            cats who don&apos;t get enough physical activity.
          </p>
          <p>
            For kittens, we recommend our teething toys and soft plush toys
            that are gentle on growing teeth while teaching coordination.
            Older cats benefit from gentle wand toys and catnip toys that
            encourage movement without overexertion. Whatever your cat&apos;s
            age or energy level, you&apos;ll find the perfect cat toy at
            Kitty Control.
          </p>
        </div>
      </section>

      {/* ═══════════════ Cat Toys for Every Life Stage ═══════════════ */}
      <section className="bg-beige px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
            Cat Toys for Every Life Stage
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-secondary/30 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                🐾 Kitten Toys
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                Soft, safe cat toys for kittens that help develop coordination
                and satisfy teething needs. Our kitten toys include plush mice,
                crinkle balls, and small wand toys designed for tiny paws.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium text-primary-dark hover:text-primary"
              >
                Shop kitten toys &rarr;
              </Link>
            </div>
            <div className="rounded-xl border border-secondary/30 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                🏃 Active Cat Toys
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                High-energy interactive toys for adult cats. Our best cat toys
                include automatic laser toys, electronic moving toys, flying bird
                toys, and remote control cat toys that keep active cats
                exercised and happy.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium text-primary-dark hover:text-primary"
              >
                Shop active toys &rarr;
              </Link>
            </div>
            <div className="rounded-xl border border-secondary/30 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                😺 Senior Cat Toys
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                Gentle cat toys for older cats that encourage movement without
                overexertion. Catnip toys, slow-moving puzzle toys, and soft
                kicker toys are perfect for senior cats who still enjoy
                playtime at their own pace.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium text-primary-dark hover:text-primary"
              >
                Shop senior toys &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ Section ═══════════════ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          Frequently Asked Questions About Cat Toys
        </h2>
        <div className="mt-8 space-y-6">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-secondary/30 bg-white p-5"
            >
              <h3 className="font-heading text-base font-semibold text-foreground sm:text-lg">
                {item.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60 sm:text-base">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
