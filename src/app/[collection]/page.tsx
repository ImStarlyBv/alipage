import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/models";
import { collectionStaticParams, getCollection } from "@/lib/collections";
import { SITE_URL } from "@/lib/seo/merchant-policy";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGrid from "@/components/ProductGrid";
import FaqAccordion from "@/components/FaqAccordion";
import CollectionJsonLd from "@/components/CollectionJsonLd";

/*
 * One dynamic segment for all 4 (later 8) collections rather than a directory
 * per collection: a new collection is a config entry in `src/lib/collections.ts`,
 * not a new file. Real top-level routes (`/products`, `/cart`, `/admin`, `/api`,
 * `/checkout`, `/auth`, `/account`) are unaffected — static and dynamic route
 * matchers are held in separate lists and static is exhausted first.
 *
 * `dynamicParams = false` is load-bearing, not decoration: without it, an
 * unmatched top-level path like `/about` or a typo would render this page on
 * demand and hit the `notFound()` call below, but only after doing the work —
 * and worse, that call happens inside a try/catch around a DB read, so a
 * request that errors before reaching `notFound()` could serve a 200. With
 * `dynamicParams = false`, an unlisted slug 404s at the routing layer, before
 * this file's code runs at all. `notFound()` stays as a second line of
 * defence for a param that matches the pattern below by coincidence.
 */
export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return collectionStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};

  return {
    title: collection.title,
    description: collection.description,
    alternates: {
      canonical: `/${collection.slug}`,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  let products: {
    id: string;
    title: string;
    slug: string | null;
    images: unknown;
    salePrice: unknown;
    stock: number;
  }[] = [];

  try {
    products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { slug: { in: [...collection.productSlugs] } },
          { id: { in: [...collection.productSlugs] } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        salePrice: true,
        stock: true,
      },
    });
  } catch {
    console.warn(`[${collection.slug}] Database unreachable, rendering without products`);
  }

  const productsWithSlugs = products.map((product) => ({
    ...product,
    slug: product.slug ?? product.id,
  }));

  // Membership order is editorial (best sellers first) — the DB query has no
  // ORDER BY that matches it, so re-sort by the config's own slug order.
  const orderIndex = new Map(collection.productSlugs.map((s, i) => [s, i]));
  const orderedProducts = [...productsWithSlugs].sort(
    (a, b) => (orderIndex.get(a.slug) ?? 0) - (orderIndex.get(b.slug) ?? 0)
  );

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: collection.name, url: `${SITE_URL}/${collection.slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumbs items={breadcrumbItems} />
      <CollectionJsonLd
        collection={collection}
        products={orderedProducts}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {collection.h1}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground/70">
          {collection.answer}
        </p>

        <ProductGrid
          products={orderedProducts}
          emptyMessage="These are on their way back in stock — check /products in the meantime."
        />

        {collection.crossLink && (
          <a
            href={collection.crossLink.href}
            className="mt-6 inline-block text-sm font-medium text-primary-dark hover:text-primary"
          >
            {collection.crossLink.label} &rarr;
          </a>
        )}

        <section className="mt-14 max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {collection.fabricTable.caption}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-secondary/40 text-foreground/60">
                  <th className="py-2 pr-4 font-medium">Fabric</th>
                  <th className="py-2 pr-4 font-medium">Warmth</th>
                  <th className="py-2 pr-4 font-medium">Breathability</th>
                  <th className="py-2 pr-4 font-medium">Best for</th>
                  <th className="py-2 font-medium">Watch out for</th>
                </tr>
              </thead>
              <tbody>
                {collection.fabricTable.rows.map((row) => (
                  <tr key={row.fabric} className="border-b border-secondary/20 align-top">
                    <td className="py-3 pr-4 font-medium text-foreground">{row.fabric}</td>
                    <td className="py-3 pr-4 text-foreground/70">{row.warmth}</td>
                    <td className="py-3 pr-4 text-foreground/70">{row.breathability}</td>
                    <td className="py-3 pr-4 text-foreground/70">{row.bestFor}</td>
                    <td className="py-3 text-foreground/70">{row.watchOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-foreground/70">
          {collection.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </section>

        <section className="mt-10 max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-foreground">Sizing tips</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/70">
            {collection.sizingTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-foreground">Care notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/70">
            {collection.careNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground text-center sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <FaqAccordion items={collection.faqs} name={`${collection.slug}-faq`} />
      </section>
    </div>
  );
}
