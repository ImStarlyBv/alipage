# Phase 1 remainder — collections, homepage, crawl/schema, ISR

**Date:** 2026-09-16
**Scope:** the remaining Phase 1 checklist in `SEO STRATEGY2026.md` — §3.2
collection pages, §5.3 homepage corrections, §3.3 Organization schema, §3.4 crawl
and index, §3.5 ISR.
**Status:** planned, verified against the bundled Next 16 docs, not yet started.

---

## 1. Why this batch

§3.1 shipped: product URLs are now stored and stable. What remains is the
**structural** half of Phase 1, and the site is missing it entirely.

There is **no indexable browse layer**. `/categories` renders "No categories
available yet" in production because nothing in the application ever creates an
`ImportedCategory` row — the only writer is a `deleteMany` in the admin
"clear the slate" route. All 22 products are reachable only through `/products`
and its 20-per-page list, and the homepage points six distinct category cards at
that same generic listing.

So this batch builds the keyword-targeted hub layer the catalogue is missing,
stops the homepage from advertising destinations it doesn't have, and closes the
crawl/schema gaps that keep the store out of AI answers and sitelinks.

Three live defects are fixed along the way, not just gaps filled:

| Defect | Live today | Fix |
|---|---|---|
| Homepage promises "our size chart on each product" | No size chart exists anywhere; `variants` is raw AliExpress JSON | Rewrite the copy; no invented measurements |
| `WebSite` advertises `SearchAction` on `/products?q=` | `/products/page.tsx` never reads `q` — no search exists | Remove the block |
| `/categories` is linked 5× and in the sitemap | Renders an empty state; 200 | Delete, 308 → `/products`, drop from sitemap |

Baseline probed on live production (2026-09-16): `/categories` → 200 (empty),
`/sphynx-cat-sweaters` → 404, `/collections` → 404, `/llms.txt` → 404,
`/robots.txt` → 200 (single `*` group). Live `Organization` JSON-LD has four
fields, no `@id`/`logo`/`sameAs`/`contactPoint`. Live sitemap is 25 URLs.

---

## 2. Decisions taken

1. Collection data lives in a **version-controlled TypeScript config**, not a
   database table. No migration for collections.
2. Scope = collections + homepage + robots/llms.txt + Organization + ISR.
   **Guides are out of scope** — no `/guides`, no MDX, no `Article` model.
3. The false size-chart claim is fixed by **rewriting the copy**. No size-chart
   page, no invented measurements.
4. `/categories` is replaced: links repoint to collections, **308 → `/products`**,
   removed from the sitemap.

## 3. Out of scope (deliberately)

Guides hub and the Sprint A articles; `/size-guide`, `/about`, `/shipping`,
`/returns`, `/contact` trust pages; `ProductGroup`/variant schema; Merchant Center
feed; PDP copy and metas; `@tailwindcss/typography`; dropping the now-unused
`ImportedCategory` table.

---

## 4. Work

### 4.1 Routing — one root-level dynamic segment

URLs must be keyword-matched at the root (`/sphynx-cat-sweaters`), not nested
under `/collections/`.

**Approach: `src/app/[collection]/page.tsx`** with `generateStaticParams()`
returning only the 4 known slugs.

Two route-segment exports, both load-bearing:

```ts
export const dynamicParams = false;  // mandatory
export const revalidate = 3600;
```

`dynamicParams = false` is **not optional here.** Verified in
`.../02-route-segment-config/dynamicParams.md:16-17`: with the default `true`,
any unmatched root path (`/about`, `/typo`, `/anything`) renders the collection
page and returns **200**. With `false`, unlisted params **return a 404 at the
routing layer**, before the page executes. The `notFound()` call stays as a
second line of defence but is no longer the mechanism. (`dynamicParams` is only
unavailable under Cache Components, which `next.config.ts` does not enable.)

Why one dynamic segment rather than 4 near-identical directories: 4 files now,
8 after Phase 2, each a re-export with a different constant. Here, adding a
collection is a config entry. The docs recommend this shape verbatim — runtime
validation against a known set for params with a fixed number of valid values
(`.../file-conventions/dynamic-routes.md:124-140`).

Why it's safe: static and dynamic matchers are held in separate lists and static
is exhausted first (`next/dist/server/route-matcher-managers/default-route-matcher-manager.js:88,207-224`),
so `/products`, `/cart`, `/admin`, `/api`, `/checkout`, `/auth`, `/account` are
untouched. Two known hazards, both checked at build time below:

- It matches any *unmatched* root path — closed by `dynamicParams = false`.
- A future `/guides` needs its own directory before anything is published there,
  or this segment swallows it.

**Version note (verified, non-obvious):** this Next 16 adds a `cacheComponents`
mode in which `dynamic`, `dynamicParams`, `revalidate` and `fetchCache` are
**removed** (`.../02-route-segment-config/index.md:19`). Not enabled here, so the
`revalidate` model below applies — but a future flip would invalidate §4.8
wholesale.

### 4.2 `src/lib/collections.ts` — the curated config

Typed source of truth. One entry per collection, holding everything the page
renders:

- `slug` (equals the URL segment), `name`, `h1`, `primaryKeyword`
- `title` / `description` (page metadata), `updatedAt` (ISO — the sitemap's real
  `lastModified`)
- `answer` — the 40–60 word AI-extractable summary above the grid
- `fabricTable: { caption, rows: { fabric, warmth, breathability, bestFor, watchOut }[] }`
- `body: string[]` — 300–600 words below the grid, plus `sizingTips`, `careNotes`
- `faqs: { question, answer }[]` — 3–5, feeding both the visible accordion and `FAQPage`
- `productSlugs: readonly string[]` — **hand-picked membership by slug**
- `relatedGuides: readonly { title, href }[]` — empty this batch; render nothing
  when empty so guides can be added later without touching the template

Exports also `COLLECTIONS`, `COLLECTION_SLUGS`, `getCollection(slug)`, and
`collectionStaticParams()`. The params helper lives in the lib, not the route
file, so tests can import the config **without pulling in `prisma`**.

Membership is by slug because `Product.slug` is nullable in the schema. The join
maps `slug ?? id` exactly as `src/app/page.tsx:150-153` already does. Three
consequences to keep in mind: a `slug === null` product can never be in a
collection (all 22 are slugged by the deploy backfill); `active: false` silently
drops one; and **renaming a product's slug silently removes it from every
collection** — the membership test in §4.10 is the guard.

Reuse `SITE_URL` and `BRAND_NAME` from `src/lib/seo/merchant-policy.ts`.

### 4.3 Template

Compose from what exists:

- `src/components/ProductCard.tsx` for the grid — its `slug` prop is
  non-nullable, so callers map `slug ?? id` first.
- `serializeJsonLd` from `src/lib/seo/json-ld.ts` for **every** schema block. It
  is the only serialization path; it escapes `<` to `<` so an AliExpress title
  or a review body can't break out of `</script>`.
- Grid / prose / section / H2 / button class strings copied verbatim from
  `src/app/page.tsx`.

Extract three small shared server components:

- **`FaqAccordion`** — the native `<details name=…>` block that today exists
  **only inline** at `src/app/page.tsx:550-571`, including
  `[&_summary::-webkit-details-marker]:hidden` and `group-open:rotate-45`.
  Default `name` to `undefined` so a page opts into exclusive-accordion grouping.
- **`ProductGrid`** — owns the `grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4
  lg:grid-cols-4` string, the LCP `priority` count, and the empty state.
- **`Breadcrumbs`** — a **visible** `<nav aria-label="Breadcrumb">`. Breadcrumb
  schema with no visible trail is a structured-data violation, so one array
  drives both.

JSON-LD as **one `<script>` with `@graph`**, so the `@id` cross-references
resolve in-graph and there is exactly one call to `serializeJsonLd`:

```jsonc
{ "@context": "https://schema.org", "@graph": [
  { "@type": "CollectionPage", "@id": "…/sphynx-cat-sweaters#collectionpage",
    "isPartOf":    { "@id": "https://kittycontrol.shop/#website" },
    "about":       { "@id": "https://kittycontrol.shop/#organization" },
    "mainEntity":  { "@id": "…#itemlist" },
    "breadcrumb":  { "@id": "…#breadcrumb" } },
  { "@type": "ItemList", "@id": "…#itemlist", "numberOfItems": 6,
    "itemListElement": [ { "@type": "ListItem", "position": 1,
                           "name": "…", "url": "…/products/<slug>" } ] },
  { "@type": "BreadcrumbList", "@id": "…#breadcrumb", "itemListElement": [ … ] },
  { "@type": "FAQPage", "@id": "…#faq", "mainEntity": [ … ] }
] }
```

`ListItem` carries **`url` + `name` only** — no nested `Product`. Nesting a
`Product` without `offers` creates a second, weaker Product entity for the same
URL and risks conflicting with the PDP's. `ProductJsonLd` is left untouched.

### 4.4 Product membership

11 of 22 products land in a collection; 11 orphaned until Phase 2.

| Collection | Products (by slug) |
|---|---|
| `sphynx-cat-winter-clothes` (11) | `hoodie-four-leg-fleece`, `hoodie-snug-winter-four-leg`, `jacket-arctic-fleece-lined-hoodie`, `sweatshirt-lounge-four-leg-hoodie`, `jumpsuit-pocket-fleece-turtleneck`, `jumpsuit-hooded-fleece-pajama`, `pajamas-nightfall-fleece-pullover`, `turtleneck-brushed-fleece-pullover`, `turtleneck-everyday-fleece`, `coat-heritage-fleece-turtleneck`, `sweater-classic-knit` |
| `sphynx-cat-sweaters` (6) | `sweater-classic-knit`, `christmas-sweater-festive-knit`, `turtleneck-brushed-fleece-pullover`, `turtleneck-everyday-fleece`, `coat-heritage-fleece-turtleneck`, `sweatshirt-lounge-four-leg-hoodie` |
| `sphynx-cat-hoodies` (4) | `hoodie-four-leg-fleece`, `hoodie-snug-winter-four-leg`, `sweatshirt-lounge-four-leg-hoodie`, `jacket-arctic-fleece-lined-hoodie` |
| `sphynx-cat-christmas-sweaters` (2) | `christmas-sweater-festive-knit`, `costume-cosplay-outfit` |

Multi-collection by design (a product may genuinely belong to more than one):
`sweater-classic-knit`, both turtlenecks and the heritage coat are in sweaters +
winter; all four hoodie-family pieces are in hoodies + winter.
`costume-cosplay-outfit` → christmas follows the strategy's own keyword row for
that URL ("holiday outfits, cat costumes").

**Two things flagged rather than silently decided:**

- **`/sphynx-cat-christmas-sweaters` holds only 2 products.** The strategy
  explicitly allows this ("seasonal — keep URL live all year"), and the page's
  value is the copy and a distinct query. It needs the full word budget so it
  doesn't read as thin, plus a "browse all winter clothes" link under the grid.
- **11 products have no Phase 1 collection**: both T-Shirts, Vest Tee, both
  Shirts, Cherry Blossom Tee, Cotton Four-Leg Onesie, Cartoon Cotton, Dreamtime
  Hooded, Recovery Suit. They stay reachable via `/products` until Phase 2 adds
  `/sphynx-cat-shirts` (rescues 5), `/sphynx-cat-pajamas` (rescues 3) and
  `/cat-recovery-suits` (rescues 1). Stuck to the strategy's own Phase 1 list
  rather than adding a 5th collection unilaterally. This list is pinned as a test
  fixture so a membership change is a deliberate edit.

  The Vest Tee is *not* in sweaters despite the name: the live PDP describes it
  as a **lightweight cotton sleeveless** layer for warm days, not a knit.

### 4.5 Homepage (`src/app/page.tsx`)

- **Category cards → real destinations.** `clothingCategories` (21-58) gains a
  required `href`; the hardcoded `href="/products"` at 324 becomes
  `href={cat.href}`. Replaced with the **4 cards that exist** and
  `lg:grid-cols-6` → `lg:grid-cols-4` — a 6-card grid cannot be honestly filled
  by 4 collections, and inventing URLs that 404 is worse than fewer cards. The
  Shirts/Pajamas/Costumes cards return in Phase 2.
- **Hero secondary CTA** "Browse Categories" → `/categories` retargeted (§4.7).
- **Season cards** (502-539): autumn → `/sphynx-cat-sweaters`, winter →
  `/sphynx-cat-winter-clothes`, summer stays on `/products` (no summer
  collection exists).
- **FAQ rewrite** — one edit to the `faqItems` array updates both the visible
  accordion and the `FAQPage` schema, which already read the same const:
  - **#2 fabric** → the honest per-use-case comparison: cotton is breathable and
    soft but absorbs sebum and can stain or pill; fleece is warm but pills;
    smooth synthetic/stretch blends release oil in the wash and resist licking.
    Drop the uncited organic/bamboo superiority claim and the "seamless
    construction" promise, which nothing verifies.
  - **#3 size** → drop the size-chart promise; keep the honest measuring
    guidance (neck, chest behind the front legs, back length neck→tail base,
    size up between sizes).
  - **#4 rotation** → drop "vets recommend"; never write that without a citation.
  - **#6 Rex fit** → drop the size-chart check, same reason as #3.
- **Prose 409-484** repeats the same unsourced claims. Minimal edit: remove the
  size-chart reference (469-471) and the unverifiable fabric assertions
  (435-441, 461-467), including "UPF-rated" at 431. The full rewrite of this copy
  is §5.1-5.2, Phase 2 — not this batch.
- **Preserve** the load-bearing happy-cats comment at 60-63 and every alt string
  verbatim; the alt text deliberately avoids the head term to prevent
  cannibalisation.

### 4.6 Crawl & index (§3.4)

- **`src/app/robots.ts`** — keep the `*` group byte-identical; hoist the disallow
  array into one `const`; add explicit groups for `Googlebot`, `Bingbot`,
  `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`,
  `PerplexityBot`, `Google-Extended`, `Applebot-Extended`.
  Honest framing: `*` already allows everything, so the **crawl effect is zero**.
  The value is explicit intent and per-bot switches later. `Google-Extended` and
  `Applebot-Extended` are not crawlers at all — they're opt-in tokens for AI
  training/grounding, so listing them with `Allow` is a deliberate opt-in.
- **`src/app/llms.txt/route.ts` — a generated route, not `public/llms.txt`.** A
  static file cannot list live products without going stale the moment a slug
  changes, and it can't inherit the `slug ?? id` join, so it could disagree with
  the PDP and sitemap about a URL. The handler imports `COLLECTIONS` and queries
  active products. `llms.txt` is not a reserved file convention, so a route file
  at that path is correct and won't be shadowed (same shape as the documented
  `app/rss.xml/route.ts`). `revalidate = 3600`. Expectation-setting: no major AI
  vendor consumes `llms.txt` today; the measurable §3.4 wins are the explicit
  bots and Organization `sameAs`.
- **`src/app/sitemap.ts`** — the `staticPages` array is hardcoded, so the 4
  collection URLs are added explicitly. Drop `/categories` (it 308s now, and
  advertising a redirecting URL wastes crawl budget). Group the file into
  static/collections/products sections with a comment each — the output is a flat
  `<urlset>` either way; the split is about keeping products' `lastModified`
  honest. Collections use the config's `updatedAt`, **not `new Date()`**;
  claiming every page changed on every crawl is the false freshness signal the
  strategy's "real lastModified" ask is trying to remove. Live today: 25 URLs
  (3 static + 22 products) → 28 after.
- **Also in the same file's neighbourhood:** `/products?categoryId=` gains
  `noindex,follow` (metadata becomes `generateMetadata({ searchParams })`,
  emitting `robots: { index: false }` only when `categoryId` is present). No 301
  — there is no `ImportedCategory.id → collection slug` mapping and inventing one
  would be a false mapping. This is purely defensive: `CategoryNav` already
  renders `null` when `/api/categories` returns nothing.
- **Deliberately not doing:** Bing Webmaster Tools, IndexNow, GSC property
  verification and the baseline export — all four need account access.

### 4.7 Organization schema (§3.3) and `/categories`

New `src/lib/seo/organization.ts` (values stay single-sourced off
`merchant-policy.ts`):

```ts
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
```

`layout.tsx` currently builds `organizationJsonLd` inside the `RootLayout`
function body (71-78) — re-constructed per render and unreachable from other
modules. It moves to the lib and becomes one `@graph: [ORGANIZATION, WEBSITE]`
script. The homepage's inline `websiteJsonLd` (160-173) is deleted; `WebSite`
and the inline `Brand` in `ProductJsonLd` reference `ORGANIZATION_ID` instead of
restating the name.

**Values that cannot be invented and are absent from the repo:**

1. **`logo` — blocked.** No logo asset exists (`public/` holds Next starter SVGs
   and `happy-cats/*.webp` only). Google needs ≥112×112; `favicon.ico` is too
   small. Ship the object *without* `logo`, gated on the value being set —
   never emit a URL that can't be served.
2. **`sameAs` — blocked.** No social profile URLs exist anywhere in the repo; the
   strategy names Instagram/TikTok/Pinterest/Facebook aspirationally. Emitting
   unverified `sameAs` is a false brand-identity claim. Same gate.
3. **`contactPoint.email` — blocked.** No contact email exists; the footer's
   "Contact Us" is a dead `<span>`, not a link. A `contactPoint` with no email or
   telephone is invalid.
4. `address` — omit (dropship; no verifiable address).

So this batch ships `@id` + `WebSite`/`Brand` cross-referencing, and
`logo`/`sameAs`/`contactPoint` land in a follow-up commit once the values exist.

**Broken `SearchAction`:** `WebSite` advertises
`/products?q={search_term_string}`, but `/products/page.tsx` never reads `q` and
there is no search box UI. Remove `potentialAction` in this batch rather than
shipping a false capability. (Phase 2: implement `q` + the input, then re-add.)

**`/categories`:** delete `src/app/categories/page.tsx`, add a 308
`/categories` → `/products` in `next.config.ts` (which has no `redirects()`
today; `permanent: true` is what yields the 308, matching the status the PDP
slug-move logic already returns), repoint the inbound links
(`Header.tsx:41` / `:144`, `Footer.tsx:17`, `page.tsx:236`) and drop the sitemap
entry. The redirect wins even with the file present — redirects are checked
before the filesystem — but delete it anyway to drop the dead prisma query, and
verify locally that there's no redirect loop. `ImportedCategory` becomes fully
unused; do **not** drop the table this batch.

While in the footer: the Support column's "Contact Us" and "Shipping Info" are
dead `<span>` placeholders. Leave or remove them, but don't leave them looking
clickable.

### 4.8 ISR instead of `force-dynamic` (§3.5)

**The strategy is wrong about two routes, and following it would introduce bugs.**

- **`/products` cannot become ISR.** It awaits `searchParams` for `page` and
  `categoryId` (`src/app/products/page.tsx:19-26`), and `searchParams` is a
  **request-time API** that opts the page into dynamic rendering. `revalidate`
  does not override it; `force-static` would, but it forces `searchParams` empty,
  so `?page=2` would silently serve page 1 — a soft-duplicate bug. **Leave it
  dynamic.** Its `alternates.canonical: "/products"` already handles the
  pagination-duplicate problem correctly.
- **`/sitemap.ts` stays `force-dynamic` this batch.** It is a crawl artifact, not
  a user-facing page, so TTFB has no CWV impact — which is the strategy's own
  rationale for §3.5. ISR'ing it would require wiring invalidation into
  import/sync/delete-all too.
- **PDP → `export const revalidate = 3600` is safe.** Verified: every
  interactive child (`AddToCartButton`, `StickyCartBar`, `ReviewForm`,
  `ShippingOptions`, `ImageCarousel`, `DescriptionGallery`, `Header`) is
  `"use client"`, and the only hit for `cookies|headers|auth(` in
  `products/[id]/page.tsx` is the `force-dynamic` line itself. No
  `unstable_noStore`/`connection()` anywhere in `src/`. Same profile as the
  homepage, which is already ISR.
- **Collections** start at `revalidate = 3600`.

Caching makes invalidation matter, and today it is nearly absent: exactly **one**
`revalidatePath` call site in the repo (`rename/route.ts:125`, revalidating `/`
only) and **zero** `revalidateTag`.

New `src/lib/seo/revalidate.ts` — **derive, don't enumerate**:

```ts
export function revalidateProductPaths(slugs: (string | null | undefined)[]) {
  const present = slugs.filter((s): s is string => !!s);
  const paths = new Set<string>(["/", "/products", "/llms.txt",
    ...present.map((s) => `/products/${s}`)]);
  for (const c of COLLECTIONS)                        // from the config, not hand-synced
    if (c.productSlugs.some((s) => present.includes(s))) paths.add(`/${c.slug}`);
  for (const p of paths) revalidatePath(p);
}
```

The collection list comes from `COLLECTIONS`, so a 5th collection is revalidated
automatically — that is what keeps it maintainable. Call it from:

- `api/admin/products/[id]/rename/route.ts` — replacing `revalidatePath("/")`.
  **Passing the old slug is load-bearing:** the config still holds the *old* slug,
  so the derived membership lookup only finds the collection if the old slug is in
  the list — which is exactly right, because the cached collection page still
  renders that product and must be rebuilt.
- `api/products/[id]/reviews/route.ts` POST — currently **zero** revalidation, so
  a new review never refreshes a cached PDP; a review changes
  `ProductJsonLd`'s `aggregateRating`.
- `api/cron/sync-products` — changes price and stock, or cards show stale prices.
- The other product writers (`description`, `images`, `import`, `sync`,
  `delete-all`), or ISR'd PDPs and collection grids go stale on those paths.

**Ordering hazard, resolved by sequencing:** the helper and all call sites land
**while the PDP is still `force-dynamic`** (the calls are harmless no-ops against
uncached routes), and the PDP is flipped in a *later* commit. Invalidation lands
before the cache exists.

### 4.9 `next.config.ts`

Gains its first `redirects()`:

```ts
async redirects() {
  return [{ source: "/categories", destination: "/products", permanent: true }];
}
```

### 4.10 Tests

Repo conventions: `it.each` tables, test names phrased as claims about real-world
safety, `renderToStaticMarkup` + string assertions (no jsdom, no
testing-library), and fixtures pinned with a comment saying where the data came
from and why.

First, **extract the `LIVE_PRODUCTS` table** from
`src/lib/seo/__tests__/product-slug-parity.test.ts:28-51` into a shared fixture
(`.../__tests__/fixtures/live-products.ts`, provenance comment verbatim) so the
collections tests can assert against real data **without a DB**. That test file
is otherwise untouched — it pins 22 live title→URL pairs and drift there means a
live URL 404s.

- **`src/lib/__tests__/collections.test.ts`** — `it.each` over `COLLECTIONS`:
  slug unique and `/^[a-z0-9-]+$/`; `h1` contains `primaryKeyword`
  case-insensitively; `answer` 40–60 words; `body`+`sizingTips`+`careNotes`
  300–600 words; `faqs.length` 3–5; `title` ≤60 chars and `description` ≤160;
  `updatedAt` parses and is not in the future; no duplicate `productSlugs`.
  Against the pinned fixture: **every membership slug is a live product URL**
  (this is the test that fails when someone renames a slug a collection
  references), and products-in-≥1-collection ∪ the pinned orphan list equals all
  22. `relatedGuides` is empty on all four, named *"related guides stay empty
  until the /guides hub ships — no dead links from a collection page"*.
- **`src/lib/__tests__/collection-routes.test.ts`** — `collectionStaticParams()`
  returns exactly `COLLECTIONS.map(c => ({ collection: c.slug }))`.
- **`src/components/__tests__/CollectionJsonLd.test.tsx`** — copy the
  `payloadOf` / `expectSingleScriptElement` / `BREAKOUT` helpers from
  `JsonLd.test.tsx`; assert one `<script>`, the payload parses, the `@graph` has
  the 4 types, `numberOfItems` matches the grid count, the `mainEntity` /
  `breadcrumb` `@id`s match the `CollectionPage` references exactly, every
  `ListItem.url` equals `${SITE_URL}/products/${slug}` (proves schema can't drift
  from the links), FAQ `mainEntity.length === faqs.length`, and a `</script>`
  breakout in a collection name or FAQ answer still yields exactly one closing
  tag.
- **`src/components/__tests__/ProductGrid.test.tsx`** — one
  `<a href="/products/<slug>">` per product: the grid is crawlable, not
  JS-driven.
- **`src/__tests__/content-claims.test.ts`** — reads source text with
  `fs.readFileSync` (no jsdom in this suite, so source guards are the honest
  tool): `src/app/page.tsx` contains neither `"size chart"` nor
  `"vets recommend"`, and no file under `src/app` or `src/components` contains
  `href="/categories"`. Cheap, exact regression guards for decisions 3 and 4, and
  for the £-adjacent nav failure mode where one stale link 404s from every page.

Routing/404 is not vitest-testable — it's covered by the build + curl checklist.

---

## 5. Commit & deploy sequencing

A push deploys production and costs a **~11-minute 502 window**, so commits are
grouped to be pushable independently.

| # | Commit | Push risk |
|---|---|---|
| C1 | Organization/WebSite `@id` graph, drop `SearchAction`, tests | **First safe push.** Schema only, zero URL changes |
| C2 | Homepage honesty pass (FAQ + prose) + content-claims test | Zero URL changes |
| C3 | `/categories` retirement: redirect, delete page, repoint 5 links, drop from sitemap | **First push that changes existing URL behaviour.** Verify locally |
| C4 | `src/lib/collections.ts` + fixture extraction + config tests | Dead code, nothing imports it |
| C5 | `ProductGrid`, `FaqAccordion`, `Breadcrumbs`, `CollectionJsonLd` + tests | Still unrouted |
| C6 | `src/app/[collection]/page.tsx` + `dynamicParams = false` + `revalidate`; add the 4 URLs to the sitemap | **First new live URLs** |
| C7 | Repoint nav/hero/cards/footer to collections | Every link must resolve |
| C8 | `revalidate.ts` + wire all product writers (PDP still `force-dynamic`) | No-ops today |
| C9 | Flip the PDP to `revalidate = 3600` | **Highest risk** — safe *because* C8 landed first |
| C10 | `robots.ts` AI groups + `app/llms.txt/route.ts` | Diff the `*` group to confirm no behaviour change |

The plan document itself is committed locally and its push **bundled with C1**, so
a docs-only change never costs a 502 window.

**Nothing in this batch moves a product URL.** Do not rewrite any product title —
a title rewrite moves all 22 URLs, and the parity test exists to catch exactly
that. The only existing-URL behaviour change is `/categories` 200 → 308.

---

## 6. Verification

1. `npm run build` — the artifact that actually ships; CI is not the gate.
2. `npm test` — the new tests plus 89/90 existing. The one pre-existing failure
   (`aliexpress/__tests__/services.test.ts:93`, `SyntaxError: "undefined" is not
   valid JSON`) is unrelated and must stay exactly as it is.
3. `next build` must list **exactly 4** collection routes, and after C6 the
   specific regression to check is **`/about` → 404** (not 200). `/cart`,
   `/checkout`, `/products`, `/admin` unchanged. (`/account` and `/auth` have no
   root `page.tsx` — they 404 today and still will.)
4. Local dev: each collection page renders its grid server-side (view-source
   shows real `<a href="/products/…">`), the FAQ accordion opens, JSON-LD
   validates.
5. `curl -I /categories` → **308 → `/products`**, no loop.
6. Validate the schema in Rich Results Test and the Schema.org validator before
   pushing — §3.3 requires it.
7. **After pushing** (a push deploys; a commit does not): verify by probing
   behaviour, not by trusting the push — the 4 collection URLs return 200,
   `/categories` returns 308, `/llms.txt` returns 200, and the live Organization
   JSON-LD carries the `@id`.

## 7. What needs the user

- **Logo file**, **social profile URLs**, and a **contact email** for the
  `Organization` schema. Without them, C1 ships `@id` only.
- **Confirmation of the membership table** in §4.4, especially the 2-product
  Christmas collection and the 11 products left orphaned.
- **Bing Webmaster Tools, IndexNow, GSC** — account-level, theirs to do. §3.4's
  remaining items.
- **Order samples** of the top 5 best-sellers (external).
