# SEO Implementation Plan

Based on the 138 scraped Google Search Central docs, applied to our Next.js 16 + Prisma dropshipping store.

---

## Phase 1 — Technical Foundation (Critical)

### 1.1 Metadata & Head Tags
- [ ] Add unique `<title>` and `<meta name="description">` to every page via Next.js `metadata` exports
  - `layout.tsx` → generic store-level metadata (already has basic one)
  - `/products/[id]/page.tsx` → dynamic title/description from product DB fields
  - `/categories/page.tsx` → category-specific metadata
  - `/cart`, `/checkout`, `/auth/*` → noindex these (no SEO value)
- [ ] Add `<meta name="robots" content="noindex">` to admin pages (`/admin/**`)
- [ ] Add canonical URLs via `metadata.alternates.canonical` on every public page
- [ ] Set `lang="en"` properly (already done in layout.tsx ✓)

*Docs: valid-page-metadata, robots-meta-tag, block-indexing, title-link, snippet*

### 1.2 Robots.txt
- [ ] Create `public/robots.txt` (or use Next.js `app/robots.ts` route)
  ```
  User-agent: *
  Allow: /
  Disallow: /admin/
  Disallow: /api/
  Disallow: /auth/
  Disallow: /cart
  Disallow: /checkout/
  Disallow: /account/
  Sitemap: https://yourdomain.com/sitemap.xml
  ```

*Docs: robots/intro*

### 1.3 Sitemap
- [ ] Create `app/sitemap.ts` using Next.js dynamic sitemap generation
  - Include all active product URLs from Prisma
  - Include category pages
  - Include homepage
  - Set `lastModified` from `product.updatedAt`
  - Set `changeFrequency` and `priority` per page type
- [ ] Submit sitemap to Google Search Console

*Docs: sitemaps/overview, sitemaps/build-sitemap, sitemaps/large-sitemaps*

### 1.4 Crawlability & Rendering
- [ ] Remove `export const dynamic = "force-dynamic"` from homepage — use ISR (`revalidate`) instead so Googlebot gets pre-rendered HTML
- [ ] Audit all pages: ensure critical content is in the initial server HTML, not client-fetched
- [ ] Ensure no content is hidden behind JS-only interactions that Googlebot can't trigger

*Docs: javascript/javascript-seo-basics, javascript/fix-search-javascript, googlebot*

---

## Phase 2 — Structured Data (High Impact for Ecommerce)

### 2.1 Product Schema (JSON-LD)
- [ ] Add `Product` structured data to every product page:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "...",
    "image": ["..."],
    "description": "...",
    "offers": {
      "@type": "Offer",
      "price": "...",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "..."
    }
  }
  ```
- [ ] Map `product.stock > 0` → `InStock`, else `OutOfStock`
- [ ] Include `product.salePrice` as the offer price

*Docs: structured-data/product, structured-data/merchant-listing, structured-data/product-variants*

### 2.2 Organization Schema
- [ ] Add `Organization` JSON-LD to the root layout (or homepage):
  - name, url, logo, contactPoint

*Docs: structured-data/organization*

### 2.3 Breadcrumb Schema
- [ ] Add `BreadcrumbList` JSON-LD on product and category pages:
  - Home > Category > Product

*Docs: structured-data/breadcrumb*

### 2.4 FAQ Schema (optional)
- [ ] If we add an FAQ section (shipping times, returns), mark it up with `FAQPage`

*Docs: structured-data/faqpage*

### 2.5 Validation
- [ ] Test all structured data with Google Rich Results Test
- [ ] Fix any errors/warnings

*Docs: structured-data/intro-structured-data, structured-data/sd-policies*

---

## Phase 3 — URL Structure & Navigation

### 3.1 Clean URLs
- [ ] Product pages: `/products/[slug]` instead of `/products/[id]`
  - Add `slug` field to Product model (generated from title, unique)
  - Migrate existing products
- [ ] Category pages: `/categories/[slug]`
- [ ] Keep URLs lowercase, hyphenated, no special chars

*Docs: specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites*

### 3.2 Internal Linking
- [ ] Add breadcrumb navigation component (Home > Category > Product)
- [ ] Add "Related Products" section on product pages
- [ ] Footer links to main categories
- [ ] Ensure every product is reachable within 3 clicks from homepage

*Docs: specialty/ecommerce/help-google-understand-your-ecommerce-site-structure*

### 3.3 Pagination
- [ ] Products listing: implement proper pagination (not infinite scroll)
- [ ] Use `<link rel="next">` / `<link rel="prev">` if paginated
- [ ] Each paginated page should be indexable with unique content

*Docs: specialty/ecommerce/pagination-and-incremental-page-loading*

### 3.4 Duplicate URL Handling
- [ ] Canonicalize product URLs (avoid `?variant=`, `?sort=` creating duplicates)
- [ ] Redirect trailing slashes consistently
- [ ] Handle www vs non-www via redirect

*Docs: canonicalization, consolidate-duplicate-urls, canonicalization-troubleshooting*

---

## Phase 4 — Content & On-Page SEO

### 4.1 Product Pages
- [ ] Rewrite generic AliExpress product descriptions → unique, keyword-rich copy
- [ ] Add proper H1 (product title), H2s for sections (Description, Specs, Shipping)
- [ ] Optimize product images:
  - Add descriptive `alt` text
  - Use WebP format
  - Lazy-load below-the-fold images
  - Serve responsive sizes via `next/image`

*Docs: google-images, specialty/ecommerce/share-your-product-data-with-google*

### 4.2 Category Pages
- [ ] Add unique intro text per category (not just a product grid)
- [ ] H1 = category name, meta description = category summary

### 4.3 Homepage
- [ ] The H1 "Quality Products, Great Prices" is generic — make it descriptive of what we sell
- [ ] Add more crawlable content: featured categories, value propositions, trust signals

### 4.4 Images
- [ ] Replace placeholder SVGs in `/public/` with real favicon + brand assets
- [ ] Add favicon: `app/favicon.ico` + `app/icon.tsx` for dynamic generation
- [ ] Add Open Graph images for social sharing (`metadata.openGraph.images`)

*Docs: favicon-in-search, google-images*

---

## Phase 5 — Performance & Core Web Vitals

### 5.1 Core Web Vitals
- [ ] Measure LCP, FID/INP, CLS with Lighthouse / PageSpeed Insights
- [ ] Optimize LCP: preload hero image, minimize render-blocking CSS
- [ ] Optimize CLS: set explicit width/height on all images, reserve space for dynamic content
- [ ] Optimize INP: minimize JS bundle, defer non-critical scripts

*Docs: core-web-vitals, page-experience*

### 5.2 Google Analytics Script
- [ ] Move GA script out of `<head>` — use `next/script` with `strategy="afterInteractive"` properly (it's in head currently, should be in body)
- [ ] Consider using `strategy="lazyOnload"` for non-critical tracking

### 5.3 Mobile
- [ ] Verify mobile-friendly rendering (Google uses mobile-first indexing)
- [ ] Test all pages with Chrome DevTools mobile viewport
- [ ] Ensure tap targets are ≥ 48px, font sizes ≥ 16px

*Docs: mobile/mobile-sites-mobile-first-indexing*

### 5.4 Intrusive Interstitials
- [ ] Don't add popups/modals that block content on page load
- [ ] Cookie banners should be non-intrusive

*Docs: avoid-intrusive-interstitials*

---

## Phase 6 — Search Console & Monitoring

### 6.1 Google Search Console Setup
- [ ] Verify domain ownership
- [ ] Submit sitemap
- [ ] Monitor index coverage report
- [ ] Check for crawl errors weekly

*Docs: monitor-debug/search-console-start*

### 6.2 Link Google Analytics ↔ Search Console
- [ ] Connect GA4 property (G-RVCJDY77VJ) with Search Console

*Docs: monitor-debug/google-analytics-search-console*

### 6.3 Monitor Search Traffic
- [ ] Set up alerts for traffic drops
- [ ] Track top queries and pages

*Docs: monitor-debug/debugging-search-traffic-drops, monitor-debug/bubble-chart-analysis*

---

## Phase 7 — Ecommerce-Specific SEO

### 7.1 Product Data for Google
- [ ] Set up Google Merchant Center feed (optional but powerful)
- [ ] Ensure product structured data includes: price, currency, availability, brand, SKU
- [ ] Add review/rating structured data once we have customer reviews

*Docs: specialty/ecommerce/share-your-product-data-with-google, specialty/ecommerce/where-ecommerce-data-can-appear-on-google*

### 7.2 Product Reviews
- [ ] Implement customer review system
- [ ] Add `AggregateRating` to product structured data
- [ ] Follow Google's review guidelines (real reviews only)

*Docs: specialty/ecommerce/write-high-quality-reviews, appearance/reviews-system*

### 7.3 Shipping & Return Policies
- [ ] Create dedicated shipping info page
- [ ] Create returns/refund policy page
- [ ] Add `ShippingDetails` and `MerchantReturnPolicy` structured data

*Docs: structured-data/shipping-policy, structured-data/return-policy*

### 7.4 Launching Right
- [ ] Before going live: test with `site:yourdomain.com` that pages are indexed
- [ ] Use URL Inspection tool in Search Console for critical pages
- [ ] Don't launch with duplicate/thin product descriptions

*Docs: specialty/ecommerce/how-to-launch-an-ecommerce-website*

---

## Phase 8 — Security & Spam Prevention

### 8.1 HTTPS
- [ ] Ensure entire site is served over HTTPS (hosting config)
- [ ] No mixed content warnings

### 8.2 Outbound Links
- [ ] Add `rel="nofollow"` or `rel="sponsored"` to any paid/affiliate links
- [ ] AliExpress product source links (if exposed) should be `nofollow`

*Docs: qualify-outbound-links*

### 8.3 User-Generated Content
- [ ] If/when reviews are added: sanitize HTML (already using DOMPurify ✓)
- [ ] Add `rel="ugc"` to any user-submitted links
- [ ] Prevent spam abuse

*Docs: monitor-debug/prevent-abuse, essentials/spam-policies*

---

## Priority Order (what to do first)

1. **Robots.txt + Sitemap** (30 min) — unblocks indexing
2. **Metadata on all pages** (1-2 hrs) — immediate ranking signal
3. **Product JSON-LD structured data** (1 hr) — rich results in search
4. **Remove force-dynamic from homepage** (5 min) — better crawling
5. **Noindex admin/auth/cart pages** (15 min) — clean index
6. **Slug-based URLs** (2 hrs) — better URL signals
7. **Search Console setup** (15 min) — start monitoring
8. **Core Web Vitals audit** (ongoing)
9. **Content rewriting** (ongoing)
10. **Merchant Center + reviews** (later)
