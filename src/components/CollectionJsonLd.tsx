import { SITE_URL } from "@/lib/seo/merchant-policy";
import { ORGANIZATION_ID, WEBSITE_ID } from "@/lib/seo/organization";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import type { Collection } from "@/lib/collections";

interface CollectionJsonLdProduct {
  slug: string;
  title: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface CollectionJsonLdProps {
  collection: Collection;
  products: readonly CollectionJsonLdProduct[];
  breadcrumbItems: readonly BreadcrumbItem[];
}

/**
 * One `<script>` holding the whole graph for a collection page, so every
 * `@id` cross-reference resolves in-graph and there is exactly one call to
 * `serializeJsonLd` (the only path that escapes `<` and blocks a `</script>`
 * breakout from a product title or FAQ answer).
 *
 * `ListItem` carries `url` + `name` only, never a nested `Product`: a
 * `Product` node with no `offers` would be a second, weaker entity for the
 * same URL and risks disagreeing with the PDP's own `ProductJsonLd`.
 */
export default function CollectionJsonLd({
  collection,
  products,
  breadcrumbItems,
}: CollectionJsonLdProps) {
  const pageUrl = `${SITE_URL}/${collection.slug}`;
  const collectionPageId = `${pageUrl}#collectionpage`;
  const itemListId = `${pageUrl}#itemlist`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const faqId = `${pageUrl}#faq`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "CollectionPage",
      "@id": collectionPageId,
      url: pageUrl,
      name: collection.h1,
      description: collection.description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
      mainEntity: { "@id": itemListId },
      breadcrumb: { "@id": breadcrumbId },
    },
    {
      "@type": "ItemList",
      "@id": itemListId,
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.title,
        url: `${SITE_URL}/products/${product.slug}`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  ];

  if (collection.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": faqId,
      mainEntity: collection.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
