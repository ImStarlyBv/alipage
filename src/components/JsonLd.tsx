import {
  SITE_URL,
  BRAND_NAME,
  SHIPPING_DETAILS,
  RETURN_POLICY,
  priceValidUntil,
} from "@/lib/seo/merchant-policy";

interface ProductReviewLd {
  rating: number;
  body: string;
  authorName: string;
  createdAt: Date | string;
}

interface ProductRatingLd {
  average: number;
  count: number;
}

interface ProductJsonLdProps {
  product: {
    title: string;
    description: string;
    images: string[];
    salePrice: number;
    stock: number;
    slug: string;
    category?: { name: string } | null;
  };
  /** Only pass when there are real, on-page reviews — drives aggregateRating. */
  rating?: ProductRatingLd;
  /** Real, on-page reviews — emitted as `review` items. */
  reviews?: ProductReviewLd[];
}

export function ProductJsonLd({ product, rating, reviews }: ProductJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.slice(0, 5),
    description:
      product.description
        ?.replace(/<[^>]*>/g, "")
        .slice(0, 500)
        .trim() || product.title,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      price: product.salePrice.toFixed(2),
      priceCurrency: "USD",
      priceValidUntil: priceValidUntil(),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
      shippingDetails: SHIPPING_DETAILS,
      hasMerchantReturnPolicy: RETURN_POLICY,
    },
    ...(product.category ? { category: product.category.name } : {}),
  };

  // Google requires aggregateRating/review to reflect reviews visible on the
  // page. Only emit them when real reviews exist — never fabricate ratings.
  if (rating && rating.count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.average.toFixed(1),
      reviewCount: rating.count,
      bestRating: "5",
      worstRating: "1",
    };
  }

  if (reviews && reviews.length > 0) {
    jsonLd.review = reviews.slice(0, 20).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
        worstRating: "1",
      },
      author: { "@type": "Person", name: r.authorName },
      reviewBody: r.body,
      datePublished:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString().split("T")[0]
          : String(r.createdAt).split("T")[0],
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
